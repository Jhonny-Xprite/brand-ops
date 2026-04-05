/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo, useRef, useState } from 'react'

import { formatFileSize, getFileTypeLabel, getNextFocusIndex, type ViewMode } from '@/lib/creativeLibraryBrowser'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import type { CreativeFileWithMetadata } from '@/lib/types'
import { buildVersioningPresentation } from '@/lib/versioning/presentation'
import type { VersioningLifecycleState } from '@/lib/versioning/types'

interface FileListProps {
  activeFileId: string | null
  files: CreativeFileWithMetadata[]
  hasActiveFilters?: boolean
  selectedFileIds: string[]
  viewMode: ViewMode
  versioningByFileId?: Record<string, VersioningLifecycleState>
  onSelectFile(
    fileId: string,
    event: React.MouseEvent | React.KeyboardEvent,
    isRangeSelection?: boolean
  ): void
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'Approved':
      return 'border-status-success/30 bg-status-success/10 text-status-success'
    case 'In Review':
      return 'border-status-warning/30 bg-status-warning/10 text-status-warning'
    case 'Done':
      return 'border-status-info/30 bg-status-info/10 text-status-info'
    default:
      return 'border-border bg-surface-default text-text-muted'
  }
}

function getVersionClasses(tone: 'neutral' | 'info' | 'warning' | 'success' | 'error') {
  switch (tone) {
    case 'info':
      return 'border-status-info/30 bg-status-info/10 text-status-info'
    case 'warning':
      return 'border-status-warning/30 bg-status-warning/10 text-status-warning'
    case 'success':
      return 'border-status-success/30 bg-status-success/10 text-status-success'
    case 'error':
      return 'border-status-error/30 bg-status-error/10 text-status-error'
    default:
      return 'border-border bg-surface-subtle text-text-muted'
  }
}

const FileList: React.FC<FileListProps> = ({
  activeFileId,
  files,
  hasActiveFilters = false,
  selectedFileIds,
  viewMode,
  versioningByFileId = {},
  onSelectFile,
}) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [brokenPreviewIds, setBrokenPreviewIds] = useState<string[]>([])
  const items = useMemo(() => files, [files])

  const handleKeyDown = (event: React.KeyboardEvent, index: number, fileId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectFile(fileId, event)
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const nextIndex = getNextFocusIndex(
        index,
        event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
        items.length,
        viewMode,
      )

      if (nextIndex !== -1) {
        event.preventDefault()
        const buttons = containerRef.current?.querySelectorAll('button')
        buttons?.[nextIndex]?.focus()
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-surface px-8 py-16 text-center shadow-sm">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-border bg-surface-subtle text-3xl text-text-muted/45">
          0
        </div>
        <h3 className="text-2xl font-display font-semibold text-text">
          {hasActiveFilters ? t('creative_library.empty_filters_title') : t('creative_library.empty_results_title')}
        </h3>
        <p className="mt-3 max-w-md text-base text-text-muted">
          {hasActiveFilters ? t('creative_library.empty_filters_subtitle') : t('creative_library.empty_results_subtitle')}
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        ref={containerRef}
        layout
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
            : 'flex flex-col gap-4'
        }
        role="grid"
        aria-label="Creative assets library"
      >
        {items.map((file, index) => {
          const isSelected = selectedFileIds.includes(file.id)
          const isActive = activeFileId === file.id
          const metadata = file.metadata
          const fileType = metadata?.type ?? file.type
          const showImagePreview = fileType === 'image' && !brokenPreviewIds.includes(file.id)
          const fileStatus = metadata?.status || 'Draft'
          const versioningState = versioningByFileId[file.id]
          const versioningPresentation = versioningState
            ? buildVersioningPresentation(versioningState, file.filename)
            : null
          const previewLabel = getFileTypeLabel(file.type)
          const fileTypeLabel =
            fileType === 'image'
              ? t('metadata.types.image')
              : fileType === 'video'
                ? t('metadata.types.video')
                : fileType === 'carousel'
                  ? t('metadata.types.carousel')
                  : fileType === 'document'
                    ? t('metadata.types.document')
                    : t('metadata.types.other')
          const fileStatusLabel =
            fileStatus === 'Draft'
              ? t('status.draft')
              : fileStatus === 'In Review'
                ? t('status.in_review')
                : fileStatus === 'Approved'
                  ? t('status.approved')
                  : fileStatus === 'Done'
                    ? t('status.done')
                    : fileStatus
          const updatedAtLabel = new Date(file.updatedAt).toLocaleDateString()

          return (
            <motion.button
              key={file.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              onClick={(event) => onSelectFile(file.id, event, event.shiftKey)}
              onKeyDown={(event) => handleKeyDown(event, index, file.id)}
              className={
                viewMode === 'grid'
                  ? `group overflow-hidden rounded-[1.75rem] border bg-surface text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-action-primary/30 hover:shadow-md ${
                      isSelected ? 'border-action-primary ring-2 ring-action-primary/15' : 'border-border'
                    } ${isActive ? 'shadow-md' : ''}`
                  : `group flex items-center gap-4 rounded-[1.5rem] border bg-surface px-4 py-4 text-left shadow-sm transition-all hover:border-action-primary/30 hover:shadow-md ${
                      isSelected ? 'border-action-primary ring-2 ring-action-primary/15' : 'border-border'
                    }`
              }
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-surface-subtle">
                    {showImagePreview ? (
                      <img
                        src={`/api/files/${file.id}?asset=preview`}
                        alt={file.filename}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setBrokenPreviewIds((previous) =>
                            previous.includes(file.id) ? previous : [...previous, file.id],
                          )
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-display font-bold uppercase tracking-[0.25em] text-text-muted/25">
                        {previewLabel}
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${getStatusClasses(fileStatus)}`}>
                        {fileStatusLabel}
                      </span>
                      {versioningPresentation ? (
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${getVersionClasses(versioningPresentation.tone)}`}>
                          {versioningPresentation.badgeLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2 px-5 py-5">
                    <h4 className="truncate text-xl font-semibold text-text">{file.filename}</h4>
                    <p className="text-sm text-text-muted">{fileTypeLabel}</p>
                    <div className="flex items-center justify-between gap-4 text-sm text-text-muted">
                      <span>{updatedAtLabel}</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border bg-surface-subtle">
                    {showImagePreview ? (
                      <img
                        src={`/api/files/${file.id}?asset=preview`}
                        alt={file.filename}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setBrokenPreviewIds((previous) =>
                            previous.includes(file.id) ? previous : [...previous, file.id],
                          )
                        }
                      />
                    ) : (
                      <span className="text-lg font-bold uppercase tracking-[0.25em] text-text-muted/35">
                        {previewLabel}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="truncate text-lg font-semibold text-text">{file.filename}</h4>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${getStatusClasses(fileStatus)}`}>
                        {fileStatusLabel}
                      </span>
                      {versioningPresentation ? (
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${getVersionClasses(versioningPresentation.tone)}`}>
                          {versioningPresentation.badgeLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                      <span>{fileTypeLabel}</span>
                      <span>&bull;</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>&bull;</span>
                      <span>{updatedAtLabel}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

export default FileList
