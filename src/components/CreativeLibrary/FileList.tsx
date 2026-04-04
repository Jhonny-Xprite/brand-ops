/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo, useRef, useState } from 'react'
import { getFileTypeLabel, getNextFocusIndex, type ViewMode } from '@/lib/creativeLibraryBrowser'
import type { CreativeFileWithMetadata } from '@/lib/types'
import {
  buildVersioningPresentation,
} from '@/lib/versioning/presentation'
import type { VersioningLifecycleState } from '@/lib/versioning/types'

interface FileListProps {
  activeFileId: string | null
  files: CreativeFileWithMetadata[]
  selectedFileIds: string[]
  viewMode: ViewMode
  versioningByFileId?: Record<string, VersioningLifecycleState>
  onSelectFile(
    fileId: string,
    event: React.MouseEvent | React.KeyboardEvent,
    isRangeSelection?: boolean
  ): void
}

/**
 * FileList Component (Premium Elevation)
 * Renders the asset list with orchestrated reordering and refined interaction feedback.
 */
const FileList: React.FC<FileListProps> = ({
  activeFileId,
  files,
  selectedFileIds,
  viewMode,
  versioningByFileId = {},
  onSelectFile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [brokenPreviewIds, setBrokenPreviewIds] = useState<string[]>([])

  const items = useMemo(() => files, [files])

  // Accessibility handle
  const handleKeyDown = (event: React.KeyboardEvent, index: number, fileId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectFile(fileId, event)
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const nextIndex = getNextFocusIndex(index, event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', items.length, viewMode)
      if (nextIndex !== -1) {
        event.preventDefault()
        const buttons = containerRef.current?.querySelectorAll('button')
        buttons?.[nextIndex]?.focus()
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Approved': return 'bg-status-success/10 text-status-success border-status-success/20'
      case 'In Review': return 'bg-status-warning/10 text-status-warning border-status-warning/20'
      case 'Draft': return 'bg-surface-muted text-text-muted border-border'
      default: return 'bg-surface-muted text-text-muted border-border'
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-surface-muted/30 p-12 text-center">
        <div className="empty-state-icon mb-6 h-16 w-16 text-2xl bg-surface-canvas rounded-2xl flex items-center justify-center text-text-muted/40 font-bold border border-border/30">
          ∅
        </div>
        <h3 className="text-xl font-display font-bold text-text">No assets found</h3>
        <p className="mt-2 text-text-muted max-w-sm">
          Drop files into the workspace or clear filters to start curating your library.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        ref={containerRef}
        layout
        className={viewMode === 'grid' 
          ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'flex flex-col gap-3'}
        role="grid"
        aria-label="Creative assets library"
      >
        {items.map((file, index) => {
          const isSelected = selectedFileIds.includes(file.id)
          const isActive = activeFileId === file.id
          const metadata = file.metadata
          const fileType = metadata?.type ?? file.type
          const showImagePreview = fileType === 'image' && !brokenPreviewIds.includes(file.id)
          
          const versioningState = versioningByFileId[file.id]
          const versioningPresentation = versioningState ? 
            buildVersioningPresentation(versioningState, file.filename) : 
            null

          return (
            <motion.button
              key={file.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25,
                layout: { duration: 0.3 }
              }}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              onClick={(event) => onSelectFile(file.id, event, event.shiftKey)}
              onKeyDown={(event) => handleKeyDown(event, index, file.id)}
              className={
                viewMode === 'grid'
                  ? `panel-shell group flex flex-col p-4 text-left transition-shadow hover:shadow-xl ${
                      isSelected ? 'ring-2 ring-action-primary bg-action-primary/5' : ''
                    } ${isActive ? 'ring-1 ring-action-primary/40' : ''}`
                  : `flex items-center gap-4 p-3 rounded-2xl border border-border bg-surface transition-all hover:border-action-primary/40 group ${
                      isSelected ? 'bg-action-primary/5 border-action-primary ring-1 ring-action-primary/20' : ''
                    }`
              }
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-canvas mb-4 shadow-inner group-hover:shadow-md transition-shadow">
                    {showImagePreview ? (
                      <motion.img 
                        layoutId={`img-${file.id}`}
                        src={`/api/files/${file.id}?asset=preview`}
                        className="h-full w-full object-cover"
                        onError={() => setBrokenPreviewIds(prev => [...prev, file.id])}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-text-muted/20 font-display font-bold uppercase tracking-widest">
                        {file.type.substring(0, 2)}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(metadata?.status || 'Draft')}`}>
                        {metadata?.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-bold text-text group-hover:text-action-primary transition-colors">
                      {file.filename}
                    </h4>
                    <p className="mt-1 text-xs text-text-muted font-medium">
                      {getFileTypeLabel(file.type)} • {formatFileSize(Number(file.size))}
                    </p>
                    {versioningPresentation ? (
                      <div className="mt-3">
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-${versioningPresentation.tone}/10 text-${versioningPresentation.tone} border border-${versioningPresentation.tone}/20`}>
                            {versioningPresentation.badgeLabel}
                         </span>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-canvas overflow-hidden shadow-inner font-mono text-xs font-bold text-text-muted">
                    {showImagePreview ? (
                      <motion.img 
                        layoutId={`img-${file.id}`}
                        src={`/api/files/${file.id}?asset=preview`}
                        className="h-full w-full object-cover"
                        onError={() => setBrokenPreviewIds(prev => [...prev, file.id])}
                      />
                    ) : (
                      file.type.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-3">
                      <h4 className="truncate font-bold text-text group-hover:text-action-primary transition-colors">
                        {file.filename}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(metadata?.status || 'Draft')}`}>
                        {metadata?.status || 'Draft'}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1 opacity-60">
                      {getFileTypeLabel(file.type)} • {formatFileSize(Number(file.size))} • {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {versioningPresentation ? (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-${versioningPresentation.tone}/10 text-${versioningPresentation.tone}`}>
                        {versioningPresentation.badgeLabel}
                      </span>
                    ) : null}
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-action-primary shadow-[0_0_8px_rgba(var(--action-primary-rgb),0.6)]" />
                    )}
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
