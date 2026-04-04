import {
  buildVersioningPresentation,
  isRefreshRequiredState,
  shouldShowVersioningNotice,
  type VersioningLifecycleState,
} from '@/lib/versioning'

function createState(overrides: Partial<VersioningLifecycleState>): VersioningLifecycleState {
  return {
    fileId: 'file-1',
    jobId: 'job-1',
    state: 'queued',
    operationType: 'metadata',
    attempt: 0,
    updatedAt: '2026-04-04T10:00:00.000Z',
    batchEligible: true,
    ...overrides,
  }
}

describe('versioning presentation', () => {
  it('describes queued state as local-save success plus pending version history work', () => {
    const presentation = buildVersioningPresentation(
      createState({ state: 'queued' }),
      'launch.png',
    )

    expect(presentation?.title).toBe('Local save complete')
    expect(presentation?.message).toContain('Version save queued')
    expect(presentation?.badgeLabel).toBe('Queued')
  })

  it('maps refresh-required failures to a blocking recovery presentation', () => {
    const state = createState({
      state: 'failed',
      errorCode: 'CON-004',
      message: 'This file changed before your save finished. Refresh to review the latest version.',
    })

    const presentation = buildVersioningPresentation(state, 'launch.png')

    expect(isRefreshRequiredState(state)).toBe(true)
    expect(presentation?.showRefreshAction).toBe(true)
    expect(presentation?.blocksEditing).toBe(true)
    expect(presentation?.badgeLabel).toBe('Refresh required')
  })

  it('only keeps complete notices visible for a short recent window', () => {
    const recentState = createState({
      state: 'complete',
      updatedAt: new Date(Date.now() - 2000).toISOString(),
    })
    const staleState = createState({
      state: 'complete',
      updatedAt: new Date(Date.now() - 20000).toISOString(),
    })

    expect(shouldShowVersioningNotice(recentState)).toBe(true)
    expect(shouldShowVersioningNotice(staleState)).toBe(false)
  })
})
