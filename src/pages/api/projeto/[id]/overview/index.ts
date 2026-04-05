import type { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import {
  getTaggedValue,
  hasTag,
} from '@/lib/projectWorkspace'
import { serializeProjectLibraryItem } from '@/lib/projectLibrary'
import prisma from '@/lib/prisma'
import {
  getOverviewOriginHref,
  type OverviewEntry,
} from '@/lib/overview'

type OverviewResponse = { items: OverviewEntry[] } | { error: string }

function buildFileOverviewEntry(projectId: string, file: ReturnType<typeof serializeCreativeFile>): OverviewEntry {
  const tags = file.metadata?.tags ?? []
  const scopeTag = getTaggedValue(tags, 'scope:') ?? 'media'
  const sourceDomain = 'MEDIA_LIBRARY' as const
  const category =
    scopeTag === 'media'
      ? file.metadata?.type === 'video'
        ? 'VIDEOS'
        : 'FOTOS'
      : scopeTag.toUpperCase()

  return {
    id: file.id,
    sourceType: 'FILE',
    sourceDomain,
    category,
    title: file.filename,
    description: file.metadata?.notes ?? null,
    status: file.metadata?.status ?? 'Draft',
    kind: 'MEDIA_FILE',
    previewUrl: file.type === 'image' ? `/api/files/${file.id}?asset=preview` : undefined,
    filename: file.filename,
    mimeType: file.mimeType,
    tags,
    relations: [],
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    originHref: getOverviewOriginHref(projectId, sourceDomain),
    canRename: true,
    canDuplicate: true,
    canEditInline: false,
    payload: {
      type: file.metadata?.type ?? file.type,
      scope: scopeTag,
    },
  }
}

function buildLibraryOverviewEntry(projectId: string, item: ReturnType<typeof serializeProjectLibraryItem>): OverviewEntry {
  return {
    id: item.id,
    sourceType: 'LIBRARY_ITEM',
    sourceDomain: item.domain,
    category: item.category,
    title: item.title,
    description: item.description,
    status: item.status,
    kind: item.kind,
    previewUrl: item.assetPreviewUrl,
    filename: item.assetFilename ?? undefined,
    mimeType: item.assetMimeType ?? undefined,
    tags: [],
    relations: item.relatedItems.map((relation) => ({
      ...relation,
      targetDomain: relation.targetDomain,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    originHref: getOverviewOriginHref(projectId, item.domain),
    canRename: true,
    canDuplicate: true,
    canEditInline: true,
    payload: item.payload,
  }
}

function sortOverviewEntries(items: OverviewEntry[], sort: string): OverviewEntry[] {
  const sorted = [...items]

  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR'))
    case 'updated':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<OverviewResponse>) {
  const { id: projectId } = req.query

  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
  const domain = typeof req.query.domain === 'string' ? req.query.domain : 'ALL'
  const category = typeof req.query.category === 'string' ? req.query.category : 'ALL'
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL'
  const kind = typeof req.query.kind === 'string' ? req.query.kind : 'ALL'
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'newest'
  const withAsset = req.query.withAsset === 'true'
  const withRelations = req.query.withRelations === 'true'

  try {
    const [files, libraryItems] = await Promise.all([
      prisma.creativeFile.findMany({
        where: {
          metadata: {
            tags: {
              contains: `project-${projectId}`,
            },
          },
        },
        include: {
          metadata: true,
        },
      }),
      prisma.projectLibraryItem.findMany({
        where: { projectId },
        include: {
          assetFile: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
            },
          },
          outgoingRelations: {
            include: {
              targetItem: {
                select: {
                  id: true,
                  domain: true,
                  category: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    ])

    const fileEntries = files
      .map((file) => serializeCreativeFile(file))
      .filter((file) => hasTag(file.metadata?.tags ?? [], `project-${projectId}`))
      .map((file) => buildFileOverviewEntry(projectId, file))

    const libraryEntries = libraryItems.map((item) =>
      buildLibraryOverviewEntry(projectId, serializeProjectLibraryItem(item)),
    )

    const entries = sortOverviewEntries(
      [...fileEntries, ...libraryEntries].filter((entry) => {
        const matchesDomain = domain === 'ALL' || entry.sourceDomain === domain
        const matchesCategory = category === 'ALL' || entry.category === category
        const matchesStatus = status === 'ALL' || entry.status === status
        const matchesKind = kind === 'ALL' || entry.kind === kind
        const matchesSearch =
          !search ||
          [
            entry.title,
            entry.description,
            entry.filename,
            entry.category,
            ...(entry.tags ?? []),
            ...Object.values(entry.payload).flatMap((value) => (Array.isArray(value) ? value : [value])),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search)
        const matchesAsset = !withAsset || Boolean(entry.previewUrl || entry.filename)
        const matchesRelations = !withRelations || entry.relations.length > 0

        return (
          matchesDomain &&
          matchesCategory &&
          matchesStatus &&
          matchesKind &&
          matchesSearch &&
          matchesAsset &&
          matchesRelations
        )
      }),
      sort,
    )

    return res.status(200).json({ items: entries })
  } catch (error) {
    console.error('Failed to fetch overview entries:', error)
    return res.status(500).json({ error: 'Failed to fetch overview entries' })
  }
}
