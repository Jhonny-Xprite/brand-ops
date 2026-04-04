import type { CreativeFileWithMetadata } from '@/lib/types'
import type { VersionOperationType } from '@/lib/versioning/types'

export type HistoryOperationType = VersionOperationType | 'unknown'

export interface VersionMetadataContext {
  type: string
  status: string
  source: 'commit-message'
}

export interface VersionTimelineEntry {
  id: string
  fileId: string
  versionNum: number
  commitHash: string
  shortCommitHash: string
  message: string
  createdAt: string
  operationType: HistoryOperationType
  metadataContext: VersionMetadataContext | null
  isLatest: boolean
}

export interface VersionCompareSummary {
  currentType: string
  currentStatus: string
  historicalType: string | null
  historicalStatus: string | null
  typeChanged: boolean
  statusChanged: boolean
  summary: string
}

export interface VersionHistoryDetail extends VersionTimelineEntry {
  previewUrl: string | null
  previewKind: 'image' | 'binary' | 'unavailable'
  previewMessage: string
  compareSummary: VersionCompareSummary
}

const METADATA_MESSAGE_PATTERN = /^docs: Update .* metadata - Type: (.+), Status: (.+)$/i

export function inferHistoryOperation(message: string): HistoryOperationType {
  if (message.startsWith('feat: Upload ')) {
    return 'upload'
  }

  if (message.startsWith('docs: Update ')) {
    return 'metadata'
  }

  if (message.startsWith('update: Replace ')) {
    return 'replace'
  }

  if (message.startsWith('revert: Rollback ')) {
    return 'rollback'
  }

  return 'unknown'
}

export function extractMetadataContext(message: string): VersionMetadataContext | null {
  const match = METADATA_MESSAGE_PATTERN.exec(message)

  if (!match) {
    return null
  }

  const [, type, status] = match

  if (!type || !status) {
    return null
  }

  return {
    type: type.trim(),
    status: status.trim(),
    source: 'commit-message',
  }
}

export function toShortCommitHash(commitHash: string): string {
  return commitHash.slice(0, 7)
}

export function buildVersionTimelineEntry(
  version: {
    id: string
    fileId: string
    versionNum: number
    commitHash: string
    message: string
    createdAt: Date | string
  },
  isLatest: boolean,
): VersionTimelineEntry {
  return {
    id: version.id,
    fileId: version.fileId,
    versionNum: version.versionNum,
    commitHash: version.commitHash,
    shortCommitHash: toShortCommitHash(version.commitHash),
    message: version.message,
    createdAt: typeof version.createdAt === 'string' ? version.createdAt : version.createdAt.toISOString(),
    operationType: inferHistoryOperation(version.message),
    metadataContext: extractMetadataContext(version.message),
    isLatest,
  }
}

export function buildVersionCompareSummary(
  file: Pick<CreativeFileWithMetadata, 'type' | 'metadata'>,
  version: Pick<VersionTimelineEntry, 'metadataContext' | 'isLatest' | 'versionNum'>,
): VersionCompareSummary {
  const currentType = file.metadata?.type ?? file.type
  const currentStatus = file.metadata?.status ?? 'Draft'
  const historicalType = version.metadataContext?.type ?? null
  const historicalStatus = version.metadataContext?.status ?? null

  if (!version.metadataContext) {
    return {
      currentType,
      currentStatus,
      historicalType,
      historicalStatus,
      typeChanged: false,
      statusChanged: false,
      summary: version.isLatest
        ? 'This is the latest saved version. Compare it against the live file preview and commit context.'
        : 'This version keeps file and commit context, but full metadata snapshot details were not stored for this save.',
    }
  }

  const typeChanged = currentType !== historicalType
  const statusChanged = currentStatus !== historicalStatus

  return {
    currentType,
    currentStatus,
    historicalType,
    historicalStatus,
    typeChanged,
    statusChanged,
    summary:
      !typeChanged && !statusChanged
        ? `Current metadata still matches v${version.versionNum}.`
        : `Current metadata has drifted from v${version.versionNum}. Review the differences before restoring.`,
  }
}
