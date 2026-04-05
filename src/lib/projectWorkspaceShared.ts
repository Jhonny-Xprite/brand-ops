export type ProjectWorkspaceScope =
  | 'all'
  | 'strategy'
  | 'media'
  | 'social'
  | 'config'
  | 'copy'
  | 'brand-core'
  | 'social-assets'
  | 'creative-production'
  | 'copy-messaging'

export function buildProjectTag(projectId: string): string {
  return `project-${projectId}`
}

export function buildScopeTag(scope: Exclude<ProjectWorkspaceScope, 'all'>): string {
  return `scope:${scope}`
}

export function hasTag(tags: string[], tag: string): boolean {
  return tags.includes(tag)
}

export function getTaggedValue(tags: string[], prefix: string): string | null {
  const match = tags.find((tag) => tag.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}

export function buildWorkspaceTags(
  projectId: string,
  scope: Exclude<ProjectWorkspaceScope, 'all'>,
  extraTags: string[] = [],
): string[] {
  return [buildProjectTag(projectId), buildScopeTag(scope), ...extraTags]
}

export function buildProjectWorkspaceActivityMessage(input: {
  filename: string
  scope: string | null
  status: string | null
}): string {
  const scopeLabel =
    input.scope === 'strategy'
      ? 'estrategia'
      : input.scope === 'media'
        ? 'midia'
        : input.scope === 'social'
          ? 'social'
          : input.scope === 'social-assets'
            ? 'social assets'
            : input.scope === 'brand-core'
              ? 'brand core'
              : input.scope === 'creative-production'
                ? 'creative production'
          : input.scope === 'copy'
            || input.scope === 'copy-messaging'
            ? 'copy'
            : 'workspace'

  const statusLabel = input.status ? ` (${input.status})` : ''
  return `${input.filename} atualizado em ${scopeLabel}${statusLabel}`
}
