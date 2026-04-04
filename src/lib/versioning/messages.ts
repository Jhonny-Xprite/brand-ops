import type { VersionMessagePayload, VersionOperationType } from '@/lib/versioning/types'

export function buildVersionCommitMessage(
  operationType: VersionOperationType,
  payload: VersionMessagePayload,
  nextVersionNum: number,
): string {
  const { filename, type, status, restoredVersion } = payload

  if (!filename) {
    throw new Error('GIT-007')
  }

  if (operationType === 'upload') {
    return `feat: Upload ${filename} (v${nextVersionNum})`
  }

  if (operationType === 'metadata') {
    if (!type || !status) {
      throw new Error('GIT-007')
    }

    return `docs: Update ${filename} metadata - Type: ${type}, Status: ${status}`
  }

  if (operationType === 'replace') {
    return `update: Replace ${filename} (v${nextVersionNum})`
  }

  if (operationType === 'rollback') {
    if (typeof restoredVersion !== 'number') {
      throw new Error('GIT-007')
    }

    return `revert: Rollback ${filename} to v${restoredVersion}`
  }

  throw new Error('GIT-007')
}
