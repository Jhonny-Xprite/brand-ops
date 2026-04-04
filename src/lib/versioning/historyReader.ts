import type { CreativeFileWithMetadata } from '@/lib/types'

import prisma from '@/lib/prisma'
import {
  buildVersionCompareSummary,
  buildVersionTimelineEntry,
  type VersionHistoryDetail,
  type VersionTimelineEntry,
} from '@/lib/versionHistory'

import { GitRepositoryAdapter } from './gitRepositoryAdapter'

const DEFAULT_STORAGE_ROOT = 'E:\\BRAND-OPS-STORAGE'

export class HistoryReader {
  private readonly gitAdapter: GitRepositoryAdapter

  constructor(storageRoot = DEFAULT_STORAGE_ROOT) {
    this.gitAdapter = new GitRepositoryAdapter(storageRoot)
  }

  async readTimeline(fileId: string): Promise<VersionTimelineEntry[]> {
    const versions = await prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: {
        versionNum: 'desc',
      },
    })

    return versions.map((version, index) => buildVersionTimelineEntry(version, index === 0))
  }

  async readDetail(
    file: Pick<CreativeFileWithMetadata, 'id' | 'type' | 'mimeType' | 'metadata'>,
    versionId: string,
  ): Promise<VersionHistoryDetail> {
    const version = await prisma.fileVersion.findFirst({
      where: {
        id: versionId,
        fileId: file.id,
      },
    })

    if (!version) {
      throw new Error('DB-004')
    }

    const latestVersion = await prisma.fileVersion.findFirst({
      where: { fileId: file.id },
      orderBy: { versionNum: 'desc' },
    })

    const entry = buildVersionTimelineEntry(version, latestVersion?.id === version.id)
    const previewCapability = this.buildPreviewCapability(file, version.id)

    return {
      ...entry,
      previewUrl: previewCapability.previewUrl,
      previewKind: previewCapability.previewKind,
      previewMessage: previewCapability.previewMessage,
      compareSummary: buildVersionCompareSummary(file, entry),
    }
  }

  readPreview(
    file: Pick<CreativeFileWithMetadata, 'path' | 'mimeType'>,
    commitHash: string,
  ): { buffer: Buffer; contentType: string } {
    if (!this.gitAdapter.hasRepository()) {
      throw new Error('GIT-001')
    }

    return {
      buffer: this.gitAdapter.readFileAtCommit(commitHash, file.path),
      contentType: file.mimeType || 'application/octet-stream',
    }
  }

  private buildPreviewCapability(
    file: Pick<CreativeFileWithMetadata, 'id' | 'mimeType'>,
    versionId: string,
  ): Pick<VersionHistoryDetail, 'previewKind' | 'previewMessage' | 'previewUrl'> {
    if (!this.gitAdapter.hasRepository()) {
      return {
        previewKind: 'unavailable',
        previewMessage: 'Version history is unavailable because the local repository is not ready.',
        previewUrl: null,
      }
    }

    if (file.mimeType?.startsWith('image/')) {
      return {
        previewKind: 'image',
        previewMessage: 'Historical image preview is available for this version.',
        previewUrl: `/api/files/${file.id}/versions/${versionId}?asset=preview`,
      }
    }

    return {
      previewKind: 'binary',
      previewMessage: 'This version can be compared through commit context today. Rich binary inspection is deferred until rollback tooling attaches here.',
      previewUrl: null,
    }
  }
}

export const historyReader = new HistoryReader()
