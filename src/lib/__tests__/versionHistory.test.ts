import type { CreativeFileWithMetadata } from '@/lib/types'

import {
  buildVersionCompareSummary,
  buildVersionTimelineEntry,
  extractMetadataContext,
  inferHistoryOperation,
} from '@/lib/versionHistory'

function createFile(): CreativeFileWithMetadata {
  return {
    id: 'file-1',
    path: 'E:\\BRAND-OPS-STORAGE\\launch.png',
    filename: 'launch.png',
    type: 'image',
    size: BigInt(2048),
    mimeType: 'image/png',
    createdAt: new Date('2026-04-04T10:00:00.000Z'),
    updatedAt: new Date('2026-04-04T10:10:00.000Z'),
    metadata: {
      id: 'meta-1',
      fileId: 'file-1',
      type: 'image',
      status: 'Approved',
      tags: ['launch'],
      notes: 'Ready to ship',
      updatedAt: new Date('2026-04-04T10:10:00.000Z'),
    },
  }
}

describe('versionHistory helpers', () => {
  it('infers operation type and metadata context from deterministic commit messages', () => {
    expect(inferHistoryOperation('feat: Upload launch.png (v1)')).toBe('upload')
    expect(inferHistoryOperation('docs: Update launch.png metadata - Type: image, Status: In Review')).toBe('metadata')
    expect(inferHistoryOperation('update: Replace launch.png (v3)')).toBe('replace')
    expect(inferHistoryOperation('revert: Rollback launch.png to v2')).toBe('rollback')

    expect(
      extractMetadataContext('docs: Update launch.png metadata - Type: image, Status: In Review'),
    ).toEqual({
      type: 'image',
      status: 'In Review',
      source: 'commit-message',
    })
  })

  it('builds compare summary against current metadata when historical metadata is available', () => {
    const file = createFile()
    const entry = buildVersionTimelineEntry(
      {
        id: 'version-1',
        fileId: 'file-1',
        versionNum: 2,
        commitHash: 'abcdef1234567890',
        message: 'docs: Update launch.png metadata - Type: image, Status: In Review',
        createdAt: new Date('2026-04-04T10:05:00.000Z'),
      },
      false,
    )

    expect(buildVersionCompareSummary(file, entry)).toEqual({
      currentType: 'image',
      currentStatus: 'Approved',
      historicalType: 'image',
      historicalStatus: 'In Review',
      typeChanged: false,
      statusChanged: true,
      summary: 'Current metadata has drifted from v2. Review the differences before restoring.',
    })
  })

  it('falls back cleanly when a version only has file and commit context', () => {
    const file = createFile()
    const entry = buildVersionTimelineEntry(
      {
        id: 'version-1',
        fileId: 'file-1',
        versionNum: 1,
        commitHash: 'abcdef1234567890',
        message: 'feat: Upload launch.png (v1)',
        createdAt: new Date('2026-04-04T10:00:00.000Z'),
      },
      false,
    )

    expect(buildVersionCompareSummary(file, entry)).toEqual({
      currentType: 'image',
      currentStatus: 'Approved',
      historicalType: null,
      historicalStatus: null,
      typeChanged: false,
      statusChanged: false,
      summary: 'This version keeps file and commit context, but full metadata snapshot details were not stored for this save.',
    })
  })
})
