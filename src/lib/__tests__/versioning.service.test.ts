import fs from 'fs'
import os from 'os'
import path from 'path'

import simpleGit from 'simple-git'

import prisma from '@/lib/prisma'
import { GitRepositoryAdapter, VersioningService } from '@/lib/versioning'

describe('VersioningService', () => {
  const tempRoots: string[] = []
  const createdFileIds: string[] = []

  afterEach(async () => {
    if (createdFileIds.length > 0) {
      await prisma.fileVersion.deleteMany({
        where: {
          fileId: {
            in: createdFileIds,
          },
        },
      })

      await prisma.fileMetadata.deleteMany({
        where: {
          fileId: {
            in: createdFileIds,
          },
        },
      })

      await prisma.creativeFile.deleteMany({
        where: {
          id: {
            in: createdFileIds,
          },
        },
      })

      createdFileIds.length = 0
    }

    while (tempRoots.length > 0) {
      const tempRoot = tempRoots.pop()

      if (tempRoot && fs.existsSync(tempRoot)) {
        fs.rmSync(tempRoot, { recursive: true, force: true })
      }
    }
  })

  it('bootstraps the storage repository and persists sequential versions for upload, metadata, and replace', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-ops-versioning-'))
    tempRoots.push(tempRoot)

    const filePath = path.join(tempRoot, 'launch.png')
    fs.writeFileSync(filePath, 'launch-v1', 'utf8')

    const file = await prisma.creativeFile.create({
      data: {
        path: filePath,
        filename: 'launch.png',
        type: 'image',
        size: BigInt(9),
        mimeType: 'image/png',
        metadata: {
          create: {
            type: 'image',
            status: 'Draft',
            tags: '[]',
            notes: 'Initial notes',
          },
        },
      },
      include: {
        metadata: true,
      },
    })
    createdFileIds.push(file.id)

    const service = new VersioningService({
      storageRoot: tempRoot,
      batchWindowMs: 20,
      retryDelaysMs: [20, 20, 20],
    })

    await service.requestVersionedChange({
      operationType: 'upload',
      fileId: file.id,
      filePath,
      messagePayload: {
        filename: file.filename,
      },
      batchEligible: false,
      allowEmptyCommit: false,
    })

    const uploadState = await service.waitForFile(file.id, 3000)
    expect(uploadState.state).toBe('complete')
    expect(fs.existsSync(path.join(tempRoot, '.git'))).toBe(true)

    await service.requestVersionedChange({
      operationType: 'metadata',
      fileId: file.id,
      filePath,
      messagePayload: {
        filename: file.filename,
        type: 'image',
        status: 'Draft',
      },
      batchEligible: true,
      allowEmptyCommit: true,
    })

    await service.requestVersionedChange({
      operationType: 'metadata',
      fileId: file.id,
      filePath,
      messagePayload: {
        filename: file.filename,
        type: 'image',
        status: 'Approved',
      },
      batchEligible: true,
      allowEmptyCommit: true,
    })

    const metadataState = await service.waitForFile(file.id, 3000)
    expect(metadataState.state).toBe('complete')

    fs.writeFileSync(filePath, 'launch-v2', 'utf8')

    await service.requestVersionedChange({
      operationType: 'replace',
      fileId: file.id,
      filePath,
      messagePayload: {
        filename: file.filename,
      },
      batchEligible: false,
      allowEmptyCommit: false,
      requiresExclusiveWrite: true,
    })

    const replaceState = await service.waitForFile(file.id, 3000)
    expect(replaceState.state).toBe('complete')

    const versions = await prisma.fileVersion.findMany({
      where: { fileId: file.id },
      orderBy: { versionNum: 'asc' },
    })

    expect(versions).toHaveLength(3)
    expect(versions[0]?.message).toBe('feat: Upload launch.png (v1)')
    expect(versions[1]?.message).toBe('docs: Update launch.png metadata - Type: image, Status: Approved')
    expect(versions[2]?.message).toBe('update: Replace launch.png (v3)')

    const gitLog = await simpleGit({ baseDir: tempRoot }).log()
    expect(gitLog.total).toBeGreaterThanOrEqual(3)

    service.dispose()
  })

  it('retries when git index lock is present and completes once the lock clears', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-ops-versioning-lock-'))
    tempRoots.push(tempRoot)

    const filePath = path.join(tempRoot, 'retry.png')
    fs.writeFileSync(filePath, 'retry-v1', 'utf8')

    const file = await prisma.creativeFile.create({
      data: {
        path: filePath,
        filename: 'retry.png',
        type: 'image',
        size: BigInt(8),
        mimeType: 'image/png',
        metadata: {
          create: {
            type: 'image',
            status: 'Draft',
            tags: '[]',
          },
        },
      },
      include: {
        metadata: true,
      },
    })
    createdFileIds.push(file.id)

    const adapter = new GitRepositoryAdapter(tempRoot)
    await adapter.ensureRepositoryReady()
    fs.writeFileSync(path.join(tempRoot, '.git', 'index.lock'), 'locked', 'utf8')

    const service = new VersioningService({
      storageRoot: tempRoot,
      batchWindowMs: 10,
      retryDelaysMs: [20, 20, 20],
      gitAdapter: adapter,
    })

    await service.requestVersionedChange({
      operationType: 'metadata',
      fileId: file.id,
      filePath,
      messagePayload: {
        filename: file.filename,
        type: 'image',
        status: 'In Review',
      },
      batchEligible: true,
      allowEmptyCommit: true,
    })

    await new Promise((resolve) => setTimeout(resolve, 40))
    fs.unlinkSync(path.join(tempRoot, '.git', 'index.lock'))

    const finalState = await service.waitForFile(file.id, 3000)
    expect(finalState.state).toBe('complete')
    expect(finalState.attempt).toBeGreaterThan(1)

    const versions = await prisma.fileVersion.findMany({
      where: { fileId: file.id },
    })

    expect(versions).toHaveLength(1)
    expect(versions[0]?.message).toContain('In Review')

    service.dispose()
  })
})
