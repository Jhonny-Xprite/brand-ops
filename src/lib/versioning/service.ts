import fs from 'fs'

import prisma from '@/lib/prisma'
import { GitRepositoryAdapter } from '@/lib/versioning/gitRepositoryAdapter'
import { buildVersionCommitMessage } from '@/lib/versioning/messages'
import type {
  StoredVersioningJob,
  VersionErrorCode,
  VersionFailureDecision,
  VersioningLifecycleState,
  VersioningRequestInput,
  VersioningRequestResult,
} from '@/lib/versioning/types'

const DEFAULT_STORAGE_ROOT = 'E:\\BRAND-OPS-STORAGE'
const DEFAULT_BATCH_WINDOW_MS = 5000
const DEFAULT_RETRY_DELAYS_MS = [1000, 3000, 10000]
const HARD_QUEUE_LIMIT = 100

interface VersioningServiceOptions {
  storageRoot?: string
  batchWindowMs?: number
  retryDelaysMs?: number[]
  gitAdapter?: GitRepositoryAdapter
}

type TimeoutHandle = ReturnType<typeof setTimeout>

export class VersioningService {
  private readonly storageRoot: string
  private readonly batchWindowMs: number
  private readonly retryDelaysMs: number[]
  private readonly gitAdapter: GitRepositoryAdapter
  private readonly jobs = new Map<string, StoredVersioningJob>()
  private readonly fileQueues = new Map<string, string[]>()
  private readonly lifecycle = new Map<string, VersioningLifecycleState>()
  private readonly timers = new Map<string, TimeoutHandle>()
  private readonly activeFiles = new Set<string>()
  private sequence = 0

  constructor(options: VersioningServiceOptions = {}) {
    this.storageRoot = options.storageRoot ?? DEFAULT_STORAGE_ROOT
    this.batchWindowMs = options.batchWindowMs ?? DEFAULT_BATCH_WINDOW_MS
    this.retryDelaysMs = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS
    this.gitAdapter = options.gitAdapter ?? new GitRepositoryAdapter(this.storageRoot)
  }

  async requestVersionedChange(input: VersioningRequestInput): Promise<VersioningRequestResult> {
    if (this.jobs.size >= HARD_QUEUE_LIMIT) {
      const failedState = this.publishState(input.fileId, this.nextJobId(), {
        state: 'failed',
        operationType: input.operationType,
        attempt: 0,
        batchEligible: !!input.batchEligible,
        errorCode: 'GIT-003',
        message: 'Too many pending version saves. Wait for the queue to clear before making more edits.',
      })

      return {
        accepted: false,
        fileId: input.fileId,
        jobId: failedState.jobId,
        state: failedState,
      }
    }

    try {
      await this.gitAdapter.ensureRepositoryReady()
    } catch (error) {
      this.logVersioningError('GIT-001', input, error, 0)
      const failedState = this.publishState(input.fileId, this.nextJobId(), {
        state: 'failed',
        operationType: input.operationType,
        attempt: 0,
        batchEligible: !!input.batchEligible,
        errorCode: 'GIT-001',
        message: 'Version history is unavailable because the local repository is not ready.',
      })

      return {
        accepted: false,
        fileId: input.fileId,
        jobId: failedState.jobId,
        state: failedState,
      }
    }

    const coalescedJob = this.tryCoalesceMetadataJob(input)

    if (coalescedJob) {
      const nextState = this.publishState(input.fileId, coalescedJob.jobId, {
        state: 'queued',
        operationType: coalescedJob.operationType,
        attempt: coalescedJob.attempt,
        batchEligible: coalescedJob.batchEligible,
        message: 'Version save queued',
      })

      return {
        accepted: true,
        fileId: input.fileId,
        jobId: coalescedJob.jobId,
        state: nextState,
      }
    }

    const jobId = this.nextJobId()
    const flushAt = Date.now() + (input.batchEligible ? this.batchWindowMs : 0)
    const job: StoredVersioningJob = {
      jobId,
      fileId: input.fileId,
      filePath: input.filePath,
      operationType: input.operationType,
      batchEligible: !!input.batchEligible,
      requiresExclusiveWrite: !!input.requiresExclusiveWrite,
      allowEmptyCommit: !!input.allowEmptyCommit,
      messagePayload: input.messagePayload,
      attempt: 0,
      flushAt,
      createdAt: Date.now(),
    }

    this.jobs.set(jobId, job)
    this.enqueueJob(job)
    this.scheduleJob(jobId, Math.max(0, flushAt - Date.now()))

    const queuedState = this.publishState(input.fileId, jobId, {
      state: 'queued',
      operationType: input.operationType,
      attempt: 0,
      batchEligible: job.batchEligible,
      message: 'Version save queued',
    })

    return {
      accepted: true,
      fileId: input.fileId,
      jobId,
      state: queuedState,
    }
  }

  getLifecycleState(fileId?: string): VersioningLifecycleState | VersioningLifecycleState[] {
    if (fileId) {
      return (
        this.lifecycle.get(fileId) ?? {
          fileId,
          jobId: '',
          state: 'idle',
          operationType: 'metadata',
          attempt: 0,
          updatedAt: new Date().toISOString(),
          batchEligible: true,
        }
      )
    }

    return Array.from(this.lifecycle.values())
  }

  async waitForFile(fileId: string, timeoutMs = 5000): Promise<VersioningLifecycleState> {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const state = this.lifecycle.get(fileId)

      if (state && (state.state === 'complete' || state.state === 'failed' || state.state === 'idle')) {
        return state
      }

      await new Promise((resolve) => setTimeout(resolve, 20))
    }

    return this.getLifecycleState(fileId) as VersioningLifecycleState
  }

  dispose(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.timers.clear()
    this.jobs.clear()
    this.fileQueues.clear()
    this.lifecycle.clear()
    this.activeFiles.clear()
  }

  private tryCoalesceMetadataJob(input: VersioningRequestInput): StoredVersioningJob | null {
    if (input.operationType !== 'metadata' || !input.batchEligible) {
      return null
    }

    const queue = this.fileQueues.get(input.fileId)
    const pendingJobId = queue?.find((jobId) => {
      const job = this.jobs.get(jobId)
      return !!job && job.operationType === 'metadata' && !this.activeFiles.has(input.fileId)
    })

    if (!pendingJobId) {
      return null
    }

    const pendingJob = this.jobs.get(pendingJobId)

    if (!pendingJob) {
      return null
    }

    pendingJob.messagePayload = input.messagePayload
    pendingJob.flushAt = Date.now() + this.batchWindowMs
    this.scheduleJob(pendingJobId, this.batchWindowMs)
    return pendingJob
  }

  private enqueueJob(job: StoredVersioningJob): void {
    const currentQueue = this.fileQueues.get(job.fileId) ?? []
    this.fileQueues.set(job.fileId, [...currentQueue, job.jobId])
  }

  private scheduleJob(jobId: string, delayMs: number): void {
    const existingTimer = this.timers.get(jobId)

    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.timers.delete(jobId)
      const job = this.jobs.get(jobId)

      if (!job) {
        return
      }

      void this.processFileQueue(job.fileId)
    }, delayMs)

    this.timers.set(jobId, timer)
  }

  private async processFileQueue(fileId: string): Promise<void> {
    if (this.activeFiles.has(fileId)) {
      return
    }

    const queue = this.fileQueues.get(fileId)
    const jobId = queue?.[0]

    if (!jobId) {
      this.lifecycle.delete(fileId)
      return
    }

    const job = this.jobs.get(jobId)

    if (!job) {
      this.shiftQueue(fileId)
      await this.processFileQueue(fileId)
      return
    }

    if (Date.now() < job.flushAt) {
      this.scheduleJob(jobId, job.flushAt - Date.now())
      return
    }

    this.activeFiles.add(fileId)
    this.publishState(fileId, jobId, {
      state: 'committing',
      operationType: job.operationType,
      attempt: job.attempt + 1,
      batchEligible: job.batchEligible,
      message: 'Saving version...',
    })

    try {
      await this.executeJob(job)
      this.jobs.delete(jobId)
      this.shiftQueue(fileId)
    } catch (error) {
      const decision = this.classifyFailure(job, error)

      if (decision.retry) {
        job.attempt += 1
        job.flushAt = Date.now() + decision.delayMs
        this.publishState(fileId, jobId, {
          state: 'retrying',
          operationType: job.operationType,
          attempt: job.attempt,
          batchEligible: job.batchEligible,
          errorCode: decision.errorCode,
          message: decision.message,
        })
        this.scheduleJob(jobId, decision.delayMs)
      } else {
        this.logVersioningError(decision.errorCode, job, error, job.attempt)
        this.publishState(fileId, jobId, {
          state: 'failed',
          operationType: job.operationType,
          attempt: job.attempt,
          batchEligible: job.batchEligible,
          errorCode: decision.errorCode,
          message: decision.message,
        })
        this.jobs.delete(jobId)
        this.shiftQueue(fileId)
      }
    } finally {
      this.activeFiles.delete(fileId)
    }

    if ((this.fileQueues.get(fileId)?.length ?? 0) > 0) {
      await this.processFileQueue(fileId)
    }
  }

  private async executeJob(job: StoredVersioningJob): Promise<void> {
    if (job.operationType !== 'metadata' && !fs.existsSync(job.filePath)) {
      throw new Error('FS-004')
    }

    if (this.gitAdapter.hasIndexLock()) {
      throw new Error('CON-002')
    }

    const nextVersionNum = await this.getNextVersionNumber(job.fileId)
    const commitMessage = buildVersionCommitMessage(job.operationType, job.messagePayload, nextVersionNum)

    if (job.operationType !== 'metadata') {
      await this.gitAdapter.stageFile(job.filePath)
    }

    const commitHash = (await this.gitAdapter.commit(commitMessage, job.allowEmptyCommit)).trim()

    try {
      await prisma.fileVersion.create({
        data: {
          fileId: job.fileId,
          versionNum: nextVersionNum,
          commitHash,
          message: commitMessage,
        },
      })
    } catch (error) {
      throw this.wrapPersistenceError(error)
    }

    this.publishState(job.fileId, job.jobId, {
      state: 'complete',
      operationType: job.operationType,
      attempt: job.attempt + 1,
      batchEligible: job.batchEligible,
      commitHash,
      versionNum: nextVersionNum,
      message: 'Version history updated.',
    })
  }

  private async getNextVersionNumber(fileId: string): Promise<number> {
    const latestVersion = await prisma.fileVersion.aggregate({
      where: { fileId },
      _max: {
        versionNum: true,
      },
    })

    return (latestVersion._max.versionNum ?? 0) + 1
  }

  private wrapPersistenceError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('locked')) {
      return new Error('DB-001')
    }

    return new Error('DB-003')
  }

  private classifyFailure(job: StoredVersioningJob, error: unknown): VersionFailureDecision {
    const code = error instanceof Error ? error.message : 'GIT-002'
    const retryDelay = this.retryDelaysMs[job.attempt]

    if (code === 'CON-002' && retryDelay !== undefined) {
      return {
        retry: true,
        delayMs: retryDelay,
        errorCode: 'CON-002',
        message: 'Versioning is busy. Your change will retry automatically.',
      }
    }

    if ((code === 'GIT-002' || code === 'DB-001') && retryDelay !== undefined) {
      return {
        retry: true,
        delayMs: retryDelay,
        errorCode: code,
        message:
          code === 'DB-001'
            ? 'Save is waiting for the database. Please hold on.'
            : 'Versioning failed. Try again. If it keeps failing, check storage and repository state.',
      }
    }

    if (code === 'FS-004') {
      return {
        retry: false,
        delayMs: 0,
        errorCode: 'FS-004',
        message: 'The file is no longer available. Choose the file again.',
      }
    }

    if (code === 'DB-003') {
      return {
        retry: false,
        delayMs: 0,
        errorCode: 'DB-003',
        message: 'Failed to save your changes. Try again.',
      }
    }

    if (code === 'GIT-007') {
      return {
        retry: false,
        delayMs: 0,
        errorCode: 'GIT-007',
        message: 'Version details could not be prepared. Try again.',
      }
    }

    return {
      retry: false,
      delayMs: 0,
      errorCode: 'GIT-002',
      message: 'Versioning failed. Try again. If it keeps failing, check storage and repository state.',
    }
  }

  private shiftQueue(fileId: string): void {
    const queue = this.fileQueues.get(fileId) ?? []
    const [, ...rest] = queue

    if (rest.length === 0) {
      this.fileQueues.delete(fileId)
      return
    }

    this.fileQueues.set(fileId, rest)
  }

  private publishState(
    fileId: string,
    jobId: string,
    partial: Omit<VersioningLifecycleState, 'fileId' | 'jobId' | 'updatedAt'>,
  ): VersioningLifecycleState {
    const nextState: VersioningLifecycleState = {
      fileId,
      jobId,
      updatedAt: new Date().toISOString(),
      ...partial,
    }

    this.lifecycle.set(fileId, nextState)
    return nextState
  }

  private nextJobId(): string {
    this.sequence += 1
    return `version-job-${this.sequence}`
  }

  private logVersioningError(
    errorCode: VersionErrorCode,
    job: Pick<StoredVersioningJob | VersioningRequestInput, 'fileId' | 'filePath' | 'operationType'>,
    error: unknown,
    attempt: number,
  ): void {
    const message = error instanceof Error ? error.message : String(error)

    console.error('[versioning]', {
      timestamp: new Date().toISOString(),
      errorCode,
      category: 'git-versioning',
      operation: job.operationType,
      entityType: 'CreativeFile',
      fileId: job.fileId,
      filePath: job.filePath,
      attempt,
      recoverable: errorCode === 'CON-002' || errorCode === 'GIT-002' || errorCode === 'DB-001',
      userVisible: true,
      rootCauseSummary: message,
    })
  }
}

declare global {
  var versioningServiceSingleton: VersioningService | undefined
}

export const versioningService =
  global.versioningServiceSingleton ??
  new VersioningService({
    storageRoot: DEFAULT_STORAGE_ROOT,
  })

if (process.env.NODE_ENV !== 'production') {
  global.versioningServiceSingleton = versioningService
}
