import React, { useEffect, useMemo, useRef, useState } from 'react'

import type { CreativeFileWithMetadata } from '@/lib/types'
import type { VersioningLifecycleState } from '@/lib/versioning'
import {
  buildVersionCompareSummary,
  type VersionHistoryDetail,
  type VersionTimelineEntry,
} from '@/lib/versionHistory'
import {
  isActiveVersioningState,
  isRefreshRequiredState,
} from '@/lib/versioning/presentation'
import { motion } from 'framer-motion'
import { MotionButton } from '@/components/atoms'
import { useAppDispatch } from '@/store'
import { fetchFiles } from '@/store/creativeLibrary/files.slice'
import { fetchVersioningStatus } from '@/store/creativeLibrary/versioning.slice'

type HistoryMode = 'view' | 'compare'

interface VersionHistoryPanelProps {
  file: CreativeFileWithMetadata
  versioningState: VersioningLifecycleState | null
}

function createFallbackCompareDetail(file: CreativeFileWithMetadata): VersionHistoryDetail {
  const summary = buildVersionCompareSummary(file, {
    metadataContext: null,
    isLatest: false,
    versionNum: 0,
  })

  return {
    id: 'fallback',
    fileId: file.id,
    versionNum: 0,
    commitHash: '',
    shortCommitHash: '',
    message: '',
    createdAt: new Date(0).toISOString(),
    operationType: 'unknown',
    metadataContext: null,
    isLatest: false,
    previewUrl: null,
    previewKind: 'unavailable',
    previewMessage: 'Version details will appear once a saved timeline entry is selected.',
    compareSummary: summary,
  }
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ file, versioningState }) => {
  const dispatch = useAppDispatch()
  const [entries, setEntries] = useState<VersionTimelineEntry[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [detail, setDetail] = useState<VersionHistoryDetail | null>(null)
  const [historyMode, setHistoryMode] = useState<HistoryMode>('view')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const entryRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lastLifecycleSignature = useRef<string | null>(null)

  const refreshHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/${file.id}/versions`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Version history is unavailable right now. Try again.')
      }

      const nextEntries = data.versions as VersionTimelineEntry[]
      setEntries(nextEntries)
      setSelectedVersionId((current) => {
        if (current && nextEntries.some((entry) => entry.id === current)) {
          return current
        }

        return nextEntries[0]?.id ?? null
      })
    } catch (refreshError) {
      setEntries([])
      setSelectedVersionId(null)
      setDetail(null)
      setError(refreshError instanceof Error ? refreshError.message : 'Version history is unavailable right now. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshHistory()
    setHistoryMode('view')
  }, [file.id])

  useEffect(() => {
    if (!selectedVersionId) {
      setDetail(null)
      setDetailError(null)
      return
    }

    let active = true

    const loadDetail = async () => {
      setDetailLoading(true)
      setDetailError(null)

      try {
        const response = await fetch(`/api/files/${file.id}/versions/${selectedVersionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Version history is unavailable right now. Try again.')
        }

        if (active) {
          setDetail(data.version as VersionHistoryDetail)
        }
      } catch (detailLoadError) {
        if (active) {
          setDetail(null)
          setDetailError(
            detailLoadError instanceof Error
              ? detailLoadError.message
              : 'Version history is unavailable right now. Try again.',
          )
        }
      } finally {
        if (active) {
          setDetailLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      active = false
    }
  }, [file.id, selectedVersionId])

  useEffect(() => {
    const signature = versioningState
      ? `${versioningState.state}:${versioningState.updatedAt}:${versioningState.versionNum ?? ''}:${versioningState.commitHash ?? ''}`
      : 'idle'

    if (lastLifecycleSignature.current === null) {
      lastLifecycleSignature.current = signature
      return
    }

    if (lastLifecycleSignature.current !== signature && !isActiveVersioningState(versioningState)) {
      void refreshHistory()
    }

    lastLifecycleSignature.current = signature
  }, [versioningState])

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedVersionId) ?? null,
    [entries, selectedVersionId],
  )

  const displayDetail = detail ?? (selectedEntry ? createFallbackCompareDetail(file) : null)
  const refreshRequired = isRefreshRequiredState(versioningState)
  const pendingHistory = isActiveVersioningState(versioningState)

  const handleHistoryKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = entries.length - 1
    let nextIndex: number

    if (event.key === 'ArrowDown') {
      nextIndex = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowUp') {
      nextIndex = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = lastIndex
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedVersionId(entries[index]?.id ?? null)
      return
    } else {
      return
    }

    event.preventDefault()
    const nextEntry = entries[nextIndex]

    if (!nextEntry) {
      return
    }

    setSelectedVersionId(nextEntry.id)
    entryRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow-label">Version History</span>
            <h3 className="mt-2 truncate text-xl font-display font-bold text-text">{file.filename}</h3>
            <p className="mt-2 text-sm text-text-muted">
              Inspect timeline entries, compare current state, and prepare for rollback in `1.4`.
            </p>
          </div>
          <MotionButton
            variant="secondary"
            className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
            onClick={async () => {
              await refreshHistory()
              await dispatch(fetchVersioningStatus(file.id)).unwrap()
            }}
          >
            Refresh
          </MotionButton>
        </div>

        {pendingHistory ? (
          <div className="mt-4 rounded-xl border border-status-info/30 bg-status-info/10 px-4 py-3 text-sm text-status-info">
            Version history is still updating for this file. The viewer will refresh when the current save settles.
          </div>
        ) : null}

        {refreshRequired ? (
          <div className="mt-4 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
            This file changed while version work was pending. Refresh the library before trusting older comparisons.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid flex-1 gap-0 overflow-hidden xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <section className="border-b border-border xl:border-b-0 xl:border-r" aria-label="Version timeline">
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Timeline</p>
              <span className="text-xs text-text-muted">
                {loading ? 'Loading...' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
              </span>
            </div>

            {entries.length === 0 && !loading && !error ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-text-muted">
                {pendingHistory
                  ? 'No completed timeline entries yet. The current save is still moving through versioning.'
                  : 'No version history has been recorded for this file yet.'}
              </div>
            ) : null}

            <div className="max-h-[28rem] space-y-3 overflow-auto pr-1">
              {entries.map((entry, index) => (
                <motion.button
                  key={entry.id}
                  ref={(node) => {
                    entryRefs.current[index] = node
                  }}
                  type="button"
                  onClick={() => setSelectedVersionId(entry.id)}
                  onKeyDown={(event) => handleHistoryKeyDown(event, index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary ${
                    entry.id === selectedVersionId
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                  aria-pressed={entry.id === selectedVersionId}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">v{entry.versionNum}</p>
                      <p className="mt-1 text-xs font-mono text-text-secondary">{entry.shortCommitHash}</p>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      {entry.operationType}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-text-primary">{entry.message}</p>
                  <p className="mt-2 text-xs text-text-secondary">{new Date(entry.createdAt).toLocaleString()}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-auto px-6 py-5" aria-label="Selected version details">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Inspect</p>
              <p className="mt-1 text-sm text-text-muted">
                Open a saved version to review commit context before compare or restore.
              </p>
            </div>

            <div className="segmented-control">
              <MotionButton
                variant="ghost"
                onClick={() => setHistoryMode('view')}
                className={`segmented-control-button ${
                  historyMode === 'view' ? 'segmented-control-button-active' : ''
                }`}
              >
                View
              </MotionButton>
              <MotionButton
                variant="ghost"
                onClick={() => setHistoryMode('compare')}
                className={`segmented-control-button ${
                  historyMode === 'compare' ? 'segmented-control-button-active' : ''
                }`}
              >
                Compare
              </MotionButton>
            </div>
          </div>

          {detailError ? (
            <div className="mb-4 rounded-xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
              {detailError}
            </div>
          ) : null}

          {!selectedEntry && !loading ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-text-muted">
              Select a version entry to inspect its commit context and preview state.
            </div>
          ) : null}

          {selectedEntry && displayDetail ? (
            <div className="space-y-5">
              <article className="rounded-2xl border border-border bg-surface px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-display font-bold text-text">v{selectedEntry.versionNum}</h4>
                      {selectedEntry.isLatest ? (
                        <span className="rounded-full bg-status-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-status-success">
                          Current saved
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-text">{selectedEntry.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-text-muted">{selectedEntry.commitHash}</p>
                    <p className="mt-2 text-xs text-text-muted">{new Date(selectedEntry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </article>

              {historyMode === 'view' ? (
                <article className="space-y-4 rounded-2xl border border-border bg-surface px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Snapshot</p>
                      <p className="mt-1 text-sm text-text-muted">{displayDetail.previewMessage}</p>
                    </div>
                    <MotionButton variant="secondary" disabled className="px-4 py-2 text-xs">
                      Restore in 1.4
                    </MotionButton>
                  </div>

                  {displayDetail.previewKind === 'image' && displayDetail.previewUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted">
                      <img
                        src={displayDetail.previewUrl}
                        alt={`Historical preview for ${file.filename} at version ${selectedEntry.versionNum}`}
                        className="h-60 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-5 py-8 text-sm text-text-muted">
                      {displayDetail.previewMessage}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Historical metadata</p>
                      <dl className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Type</dt>
                          <dd className="font-semibold text-text">
                            {displayDetail.metadataContext?.type ?? 'Unavailable'}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Status</dt>
                          <dd className="font-semibold text-text">
                            {displayDetail.metadataContext?.status ?? 'Unavailable'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Current live metadata</p>
                      <dl className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Type</dt>
                          <dd className="font-semibold text-text">{displayDetail.compareSummary.currentType}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Status</dt>
                          <dd className="font-semibold text-text">{displayDetail.compareSummary.currentStatus}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </article>
              ) : (
                <article className="space-y-4 rounded-2xl border border-border bg-surface px-5 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Compare to current</p>
                    <p className="mt-1 text-sm text-text-muted">{displayDetail.compareSummary.summary}</p>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Current asset</p>
                      <p className="mt-3 text-sm font-semibold text-text">{file.filename}</p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Type</dt>
                          <dd className="font-semibold text-text">{displayDetail.compareSummary.currentType}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Status</dt>
                          <dd className="font-semibold text-text">{displayDetail.compareSummary.currentStatus}</dd>
                        </div>
                      </dl>
                      {file.mimeType?.startsWith('image/') ? (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                          <img
                            src={`/api/files/${file.id}?asset=preview`}
                            alt={`Current preview for ${file.filename}`}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">
                        Selected version
                      </p>
                      <p className="mt-3 text-sm font-semibold text-text">v{selectedEntry.versionNum}</p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Type</dt>
                          <dd className="font-semibold text-text">
                            {displayDetail.compareSummary.historicalType ?? 'Unavailable'}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Status</dt>
                          <dd className="font-semibold text-text">
                            {displayDetail.compareSummary.historicalStatus ?? 'Unavailable'}
                          </dd>
                        </div>
                      </dl>
                      {displayDetail.previewKind === 'image' && displayDetail.previewUrl ? (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                          <img
                            src={displayDetail.previewUrl}
                            alt={`Preview for ${file.filename} at version ${selectedEntry.versionNum}`}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-text-muted">
                          {displayDetail.previewMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )}
            </div>
          ) : null}

          {detailLoading ? (
            <p className="mt-4 text-sm text-text-muted">Loading version details...</p>
          ) : null}

          <div className="mt-auto pt-5">
            <MotionButton
              variant="secondary"
              onClick={async () => {
                await dispatch(fetchFiles()).unwrap()
                await dispatch(fetchVersioningStatus(file.id)).unwrap()
                await refreshHistory()
              }}
              className="w-full"
            >
              Refresh library state
            </MotionButton>
          </div>
        </section>
      </div>
    </div>
  )
}

export default VersionHistoryPanel
