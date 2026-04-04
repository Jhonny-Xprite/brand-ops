import type { VersioningLifecycleState } from '@/lib/versioning/types'

export interface VersioningPresentation {
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  badgeLabel: string
  showRefreshAction: boolean
  blocksEditing: boolean
  isTerminal: boolean
}

export function isActiveVersioningState(state?: VersioningLifecycleState | null): boolean {
  if (!state) {
    return false
  }

  return state.state === 'queued' || state.state === 'committing' || state.state === 'retrying'
}

export function isRefreshRequiredState(state?: VersioningLifecycleState | null): boolean {
  if (!state || state.state !== 'failed') {
    return false
  }

  return state.errorCode === 'CON-004' || state.errorCode === 'CON-005'
}

export function shouldShowVersioningNotice(state?: VersioningLifecycleState | null, now = Date.now()): boolean {
  if (!state) {
    return false
  }

  if (state.state === 'complete') {
    return now - new Date(state.updatedAt).getTime() < 10000
  }

  return state.state !== 'idle'
}

export function buildVersioningPresentation(
  state?: VersioningLifecycleState | null,
  filename?: string | null,
): VersioningPresentation | null {
  if (!state) {
    return null
  }

  const assetLabel = filename ? ` for ${filename}` : ''

  if (state.state === 'queued') {
    return {
      tone: 'info',
      title: 'Local save complete',
      message: `Changes saved locally${assetLabel}. Version save queued.`,
      badgeLabel: 'Queued',
      showRefreshAction: false,
      blocksEditing: false,
      isTerminal: false,
    }
  }

  if (state.state === 'committing') {
    return {
      tone: 'info',
      title: 'Version save in progress',
      message: `Changes saved locally${assetLabel}. Saving version...`,
      badgeLabel: 'Saving version',
      showRefreshAction: false,
      blocksEditing: false,
      isTerminal: false,
    }
  }

  if (state.state === 'retrying') {
    return {
      tone: 'warning',
      title: 'Retrying version save',
      message:
        state.message || `Changes saved locally${assetLabel}. Versioning is retrying automatically.`,
      badgeLabel: 'Retrying',
      showRefreshAction: false,
      blocksEditing: false,
      isTerminal: false,
    }
  }

  if (state.state === 'complete') {
    return {
      tone: 'success',
      title: 'Version history updated',
      message: state.message || `Version history is current${assetLabel}.`,
      badgeLabel: 'Version saved',
      showRefreshAction: false,
      blocksEditing: false,
      isTerminal: true,
    }
  }

  if (state.state === 'failed') {
    if (state.errorCode === 'CON-004') {
      return {
        tone: 'error',
        title: 'Refresh required',
        message: 'This file changed before your save finished. Refresh to review the latest version.',
        badgeLabel: 'Refresh required',
        showRefreshAction: true,
        blocksEditing: true,
        isTerminal: true,
      }
    }

    if (state.errorCode === 'CON-005') {
      return {
        tone: 'error',
        title: 'Operation stopped safely',
        message: 'The operation took too long and was stopped to avoid conflicting changes.',
        badgeLabel: 'Timeout',
        showRefreshAction: true,
        blocksEditing: true,
        isTerminal: true,
      }
    }

    if (state.errorCode === 'GIT-003') {
      return {
        tone: 'error',
        title: 'Queue is full',
        message: 'Too many pending version saves. Wait for the queue to clear before making more edits.',
        badgeLabel: 'Queue full',
        showRefreshAction: false,
        blocksEditing: false,
        isTerminal: true,
      }
    }

    if (state.errorCode === 'GIT-006') {
      return {
        tone: 'error',
        title: 'Rollback could not finish',
        message: 'Rollback could not be finalized. Your current version was not replaced.',
        badgeLabel: 'Rollback failed',
        showRefreshAction: true,
        blocksEditing: true,
        isTerminal: true,
      }
    }

    return {
      tone: 'error',
      title: 'Versioning failed',
      message: state.message || 'Versioning failed. Try again. If it keeps failing, check storage and repository state.',
      badgeLabel: 'Version failed',
      showRefreshAction: false,
      blocksEditing: false,
      isTerminal: true,
    }
  }

  return {
    tone: 'neutral',
    title: 'Versioning idle',
    message: 'No pending versioning work.',
    badgeLabel: 'Idle',
    showRefreshAction: false,
    blocksEditing: false,
    isTerminal: true,
  }
}
