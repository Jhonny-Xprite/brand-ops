export type VersionOperationType = 'upload' | 'metadata' | 'replace' | 'rollback'

export type VersionLifecycleStatus = 'idle' | 'queued' | 'committing' | 'retrying' | 'failed' | 'complete'

export type VersionErrorCode =
  | 'CON-001'
  | 'GIT-001'
  | 'GIT-002'
  | 'GIT-003'
  | 'GIT-006'
  | 'GIT-007'
  | 'CON-002'
  | 'CON-003'
  | 'CON-004'
  | 'CON-005'
  | 'DB-001'
  | 'DB-003'
  | 'FS-004'

export interface VersionMessagePayload {
  filename: string
  type?: string
  status?: string
  restoredVersion?: number
}

export interface VersioningRequestInput {
  operationType: VersionOperationType
  fileId: string
  filePath: string
  messagePayload: VersionMessagePayload
  batchEligible?: boolean
  requiresExclusiveWrite?: boolean
  allowEmptyCommit?: boolean
}

export interface VersioningLifecycleState {
  fileId: string
  jobId: string
  state: VersionLifecycleStatus
  operationType: VersionOperationType
  attempt: number
  updatedAt: string
  batchEligible: boolean
  errorCode?: VersionErrorCode
  message?: string
  commitHash?: string
  versionNum?: number
}

export interface VersioningRequestResult {
  fileId: string
  jobId: string
  accepted: boolean
  state: VersioningLifecycleState
}

export interface StoredVersioningJob {
  jobId: string
  fileId: string
  filePath: string
  operationType: VersionOperationType
  batchEligible: boolean
  requiresExclusiveWrite: boolean
  allowEmptyCommit: boolean
  messagePayload: VersionMessagePayload
  attempt: number
  flushAt: number
  createdAt: number
}

export interface VersionFailureDecision {
  retry: boolean
  delayMs: number
  errorCode: VersionErrorCode
  message: string
}
