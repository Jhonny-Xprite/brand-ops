import type { ProjectLibraryItem, CreativeFile, ProjectLibraryItemRelation } from '@prisma/client'

import {
  coerceProjectLibraryDomain,
  coerceProjectLibraryItemKind,
  coerceProjectLibraryRelationType,
  parseProjectLibraryPayload,
  type SerializedProjectLibraryItem,
} from '@/lib/projectDomain'

type ProjectLibraryItemWithAsset = ProjectLibraryItem & {
  assetFile?: Pick<CreativeFile, 'id' | 'filename' | 'mimeType'> | null
  outgoingRelations?: Array<
    ProjectLibraryItemRelation & {
      targetItem: Pick<ProjectLibraryItem, 'id' | 'domain' | 'category' | 'title'>
    }
  >
}

export function serializeProjectLibraryItem(
  item: ProjectLibraryItemWithAsset,
): SerializedProjectLibraryItem {
  return {
    id: item.id,
    projectId: item.projectId,
    domain: coerceProjectLibraryDomain(item.domain),
    category: item.category,
    title: item.title,
    description: item.description,
    content: item.content,
    status: item.status,
    kind: coerceProjectLibraryItemKind(item.kind),
    payload: parseProjectLibraryPayload(item.payload),
    linkUrl: item.linkUrl,
    assetFileId: item.assetFileId,
    assetPreviewUrl: item.assetFileId ? `/api/files/${item.assetFileId}?asset=preview` : undefined,
    assetFilename: item.assetFile?.filename,
    assetMimeType: item.assetFile?.mimeType,
    isPrimary: item.isPrimary,
    relatedItems: (item.outgoingRelations ?? []).map((relation) => ({
      id: relation.id,
      relationType: coerceProjectLibraryRelationType(relation.relationType),
      targetItemId: relation.targetItem.id,
      targetDomain: coerceProjectLibraryDomain(relation.targetItem.domain),
      targetCategory: relation.targetItem.category,
      targetTitle: relation.targetItem.title,
    })),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}
