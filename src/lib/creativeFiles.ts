import type { CreativeFile as PrismaCreativeFile, FileMetadata as PrismaFileMetadata } from '@prisma/client'

import { toAppFileMetadata, type PersistedFileMetadata } from '@/lib/types'

type CreativeFileWithPersistedMetadata = PrismaCreativeFile & {
  metadata?: PrismaFileMetadata | null
}

export interface SerializedCreativeFile extends Omit<PrismaCreativeFile, 'size'> {
  size: string
  metadata?: ReturnType<typeof toAppFileMetadata> | null
}

export function serializeCreativeFile(file: CreativeFileWithPersistedMetadata): SerializedCreativeFile {
  return {
    ...file,
    size: file.size.toString(),
    metadata: file.metadata ? toAppFileMetadata(file.metadata as PersistedFileMetadata) : null,
  }
}

