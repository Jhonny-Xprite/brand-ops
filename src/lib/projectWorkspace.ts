import fs from 'fs'
import path from 'path'

import type { Prisma } from '@prisma/client'
import {
  buildProjectTag,
  buildProjectWorkspaceActivityMessage,
  buildScopeTag,
  buildWorkspaceTags,
  getTaggedValue,
  hasTag,
  type ProjectWorkspaceScope,
} from './projectWorkspaceShared'
import { STORAGE_ROOT, ensureStorageRoot } from './storageRoot'

export const PROJECT_STORAGE_ROOT = STORAGE_ROOT

export {
  buildProjectTag,
  buildProjectWorkspaceActivityMessage,
  buildScopeTag,
  buildWorkspaceTags,
  getTaggedValue,
  hasTag,
}
export type { ProjectWorkspaceScope }

export function ensureProjectScopeDirectory(
  projectId: string,
  scope: Exclude<ProjectWorkspaceScope, 'all'>,
): string {
  ensureStorageRoot(PROJECT_STORAGE_ROOT)
  const directory = path.join(PROJECT_STORAGE_ROOT, projectId, scope)
  fs.mkdirSync(directory, { recursive: true })
  return directory
}

export function buildProjectWorkspaceWhere(
  projectId: string,
  scope: ProjectWorkspaceScope = 'all',
): Prisma.CreativeFileWhereInput {
  const projectTag = buildProjectTag(projectId)

  if (scope === 'all') {
    return {
      metadata: {
        tags: {
          contains: projectTag,
        },
      },
    }
  }

  return {
    AND: [
      {
        metadata: {
          tags: {
            contains: projectTag,
          },
        },
      },
      {
        metadata: {
          tags: {
            contains: buildScopeTag(scope),
          },
        },
      },
    ],
  }
}
