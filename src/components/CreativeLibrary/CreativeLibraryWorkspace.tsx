import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

import { FadeIn, Skeleton } from '@brand-ops/ui/atoms'
import { StatusNotice } from '@brand-ops/ui/molecules'
import {
  buildProjectTag,
  buildScopeTag,
  type ProjectWorkspaceScope,
} from '@/lib/projectWorkspaceShared'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import {
  filterAndSortFiles,
  type SortOrder,
  type ViewMode,
} from '@/lib/creativeLibraryBrowser'
import { isActiveVersioningState } from '@/lib/versioning/presentation'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  clearFilesError,
  fetchFiles,
  selectFile,
  uploadFile,
  type FilesQuery,
} from '@/store/creativeLibrary/files.slice'
import { fetchVersioningStatus } from '@/store/creativeLibrary/versioning.slice'

import FileUploadInput from './FileUploadInput'

const FileList = dynamic(() => import('./FileList'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full rounded-3xl" />,
})

const MetadataForm = dynamic(() => import('./MetadataForm'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
})

export interface CreativeLibraryWorkspaceProps {
  projectId?: string
  scope?: ProjectWorkspaceScope
  title?: string
  description?: string
  eyebrow?: string
}

const VIEW_MODE_STORAGE_PREFIX = 'brand-ops:creative-library:view-mode'

function getScopeLabel(scope: ProjectWorkspaceScope) {
  switch (scope) {
    case 'media':
      return 'creative_library.scope_media'
    case 'strategy':
      return 'creative_library.scope_strategy'
    case 'social':
      return 'creative_library.scope_social'
    case 'copy':
      return 'creative_library.scope_copy'
    default:
      return 'creative_library.scope_all'
  }
}

export function CreativeLibraryWorkspace({
  projectId,
  scope = 'all',
  title,
  description,
  eyebrow,
}: CreativeLibraryWorkspaceProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { items, error, selectedFileId } = useAppSelector((state) => state.files)
  const versioningByFileId = useAppSelector((state) => state.versioning.byFileId)

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<'all' | 'image' | 'video'>('all')
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchContext = useMemo<FilesQuery>(
    () => ({
      projectId,
      scope,
    }),
    [projectId, scope],
  )

  const storageKey = `${VIEW_MODE_STORAGE_PREFIX}:${projectId ?? 'global'}:${scope}`
  const lockedTags = useMemo(() => {
    if (!projectId) {
      return []
    }

    const tags = [buildProjectTag(projectId)]
    if (scope !== 'all') {
      tags.push(buildScopeTag(scope))
    }
    return tags
  }, [projectId, scope])

  useEffect(() => {
    dispatch(fetchFiles(fetchContext))
    dispatch(fetchVersioningStatus())
  }, [dispatch, fetchContext])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const persistedViewMode = window.localStorage.getItem(storageKey)

    if (persistedViewMode === 'grid' || persistedViewMode === 'list') {
      setViewMode(persistedViewMode)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(storageKey, viewMode)
  }, [storageKey, viewMode])

  useEffect(() => {
    const hasActiveStates = Object.values(versioningByFileId).some((state) => isActiveVersioningState(state))

    if (!hasActiveStates) {
      return
    }

    const timer = window.setInterval(() => {
      void dispatch(fetchVersioningStatus())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [dispatch, versioningByFileId])

  const visibleFiles = useMemo(
    () => {
      const filteredByMediaCategory =
        scope === 'media' && mediaCategoryFilter !== 'all'
          ? items.filter((file) => (file.metadata?.type ?? file.type) === mediaCategoryFilter)
          : items

      return filterAndSortFiles(filteredByMediaCategory, {
        searchTerm,
        typeFilter,
        statusFilter,
        sortOrder,
      })
    },
    [items, mediaCategoryFilter, scope, searchTerm, sortOrder, statusFilter, typeFilter],
  )

  useEffect(() => {
    if (selectedFileId && !visibleFiles.some((file) => file.id === selectedFileId)) {
      dispatch(selectFile(null))
    }
  }, [dispatch, selectedFileId, visibleFiles])

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      await dispatch(
        uploadFile({
          file,
          projectId,
          scope,
        }),
      ).unwrap()
    }

    await dispatch(fetchFiles(fetchContext)).unwrap()
  }

  const refreshFiles = async () => {
    await dispatch(fetchFiles(fetchContext)).unwrap()
  }

  const handleRenameSelected = async () => {
    if (!selectedAsset) {
      return
    }

    const filenameBase = window.prompt('Novo nome para o ativo selecionado:', selectedAsset.filename.replace(/\.[^/.]+$/, ''))
    if (!filenameBase) {
      return
    }

    const response = await fetch(`/api/files/${selectedAsset.id}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rename',
        filenameBase,
      }),
    })

    const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel renomear este ativo.' }))) as {
      error?: string
      message?: string
    }

    if (!response.ok) {
      setActionMessage({ type: 'error', text: payload.error || 'Nao foi possivel renomear este ativo.' })
      return
    }

    await refreshFiles()
    setActionMessage({ type: 'success', text: payload.message || 'Ativo renomeado com sucesso.' })
  }

  const handleDuplicateSelected = async () => {
    if (!selectedAsset) {
      return
    }

    const response = await fetch(`/api/files/${selectedAsset.id}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'duplicate',
      }),
    })

    const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel duplicar este ativo.' }))) as {
      error?: string
      message?: string
    }

    if (!response.ok) {
      setActionMessage({ type: 'error', text: payload.error || 'Nao foi possivel duplicar este ativo.' })
      return
    }

    await refreshFiles()
    setActionMessage({ type: 'success', text: payload.message || 'Ativo duplicado com sucesso.' })
  }

  const handleOpenProperties = () => {
    const detailsPanel = document.getElementById('metadata-panel')
    detailsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    detailsPanel?.focus()
  }

  const selectedAsset = visibleFiles.find((file) => file.id === selectedFileId) ?? null
  const assetCountLabel = t('creative_library.asset_count', {
    count: visibleFiles.length,
    assetLabel:
      visibleFiles.length === 1
        ? t('creative_library.asset_singular')
        : t('creative_library.asset_plural'),
  })
  const scopeLabel = t(getScopeLabel(scope))
  const activeVersionCount = Object.values(versioningByFileId).filter((state) => isActiveVersioningState(state)).length
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortOrder !== 'newest' ||
    (scope === 'media' && mediaCategoryFilter !== 'all')

  return (
    <div className="library-workspace-shell">
      <main id="main-content" className="library-main-surface" aria-label="Creative library workspace">
        <header className="library-header-shell">
          <FadeIn direction="down">
            <div className="workspace-toolbar">
              <div>
                <div className="eyebrow-label mb-4">{eyebrow ?? 'EPIC 1.1A'}</div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-text">
                  {title ?? t('creative_library.title')}
                </h1>
                <p className="mt-3 max-w-3xl text-base text-text-muted">
                  {description ?? t('creative_library.description')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="summary-pill">{assetCountLabel}</span>
                <FileUploadInput
                  onFilesSelected={handleFilesSelected}
                  uploadContext={{ projectId, scope }}
                />
              </div>
            </div>

            <div className="library-filter-grid">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold uppercase tracking-[0.28em]">
                  {t('creative_library.search_label')}
                </span>
                <input
                  type="search"
                  aria-label="Busca"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('creative_library.search_placeholder')}
                  className="input-field text-base normal-case font-medium tracking-normal"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold uppercase tracking-[0.28em]">
                  {t('metadata.asset_type')}
                </span>
                <select
                  aria-label="Library type filter"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="select-field text-base normal-case font-medium tracking-normal"
                >
                  <option value="all">{t('creative_library.type_all')}</option>
                  <option value="image">{t('metadata.types.image')}</option>
                  <option value="video">{t('metadata.types.video')}</option>
                  <option value="carousel">{t('metadata.types.carousel')}</option>
                  <option value="document">{t('metadata.types.document')}</option>
                  <option value="other">{t('metadata.types.other')}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold uppercase tracking-[0.28em]">Status</span>
                <select
                  aria-label="Library status filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="select-field text-base normal-case font-medium tracking-normal"
                >
                  <option value="all">{t('creative_library.status_all')}</option>
                  <option value="Draft">{t('status.draft')}</option>
                  <option value="In Review">{t('status.in_review')}</option>
                  <option value="Approved">{t('status.approved')}</option>
                  <option value="Done">{t('status.done')}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold uppercase tracking-[0.28em]">
                  {t('creative_library.sort_label')}
                </span>
                <select
                  aria-label="Library sort order"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="select-field text-base normal-case font-medium tracking-normal"
                >
                  <option value="newest">{t('creative_library.sort_newest')}</option>
                  <option value="oldest">{t('creative_library.sort_oldest')}</option>
                  <option value="name-asc">{t('creative_library.sort_name_asc')}</option>
                  <option value="name-desc">{t('creative_library.sort_name_desc')}</option>
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold uppercase tracking-[0.28em]">
                  {t('creative_library.view_label')}
                </span>
                <div className="segmented-control h-[56px] items-center">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`segmented-control-button min-w-[92px] ${viewMode === 'grid' ? 'segmented-control-button-active' : ''}`}
                  >
                    {t('creative_library.view_grid')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`segmented-control-button min-w-[92px] ${viewMode === 'list' ? 'segmented-control-button-active' : ''}`}
                  >
                    {t('creative_library.view_list')}
                  </button>
                </div>
              </div>
            </div>

            {scope === 'media' ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { value: 'all', label: t('creative_library.media_category_all') },
                  { value: 'image', label: t('creative_library.media_category_images') },
                  { value: 'video', label: t('creative_library.media_category_videos') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMediaCategoryFilter(option.value as 'all' | 'image' | 'video')}
                    className={`summary-pill ${mediaCategoryFilter === option.value ? 'border-action-primary/20 bg-action-primary/10 text-action-primary' : 'border-border/60 bg-surface-subtle text-text-muted'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </FadeIn>
        </header>

        <section className="library-results-shell">
          <FadeIn direction="up" delay={0.12}>
            <div className="library-breadcrumb-row">
              <div className="flex flex-wrap items-center gap-3">
                <span className="summary-pill bg-surface-subtle">{t('creative_library.library_root')}</span>
                <span className="text-text-muted/50">/</span>
                <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                  {scopeLabel}
                </span>
                {projectId ? (
                  <span className="summary-pill">
                    {t('creative_library.project_scope_label', { projectId })}
                  </span>
                ) : null}
                {activeVersionCount > 0 ? (
                  <span className="summary-pill border-status-info/30 bg-status-info/10 text-status-info">
                    {t('creative_library.active_versions', { count: activeVersionCount })}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>{t('creative_library.assets_ready', { count: visibleFiles.length })}</span>
                <span className="text-text-muted/50">|</span>
                <span>{t('creative_library.drop_hint')}</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.18}>
            <div className="library-action-bar">
              <div className="library-action-copy">
                <div className="eyebrow-label text-text-muted">{t('creative_library.actions_label')}</div>
                <p className="mt-3 text-lg font-semibold text-text">
                  {selectedAsset
                    ? t('creative_library.actions_selected', { filename: selectedAsset.filename })
                    : t('creative_library.actions_empty')}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  {t('creative_library.actions_shortcuts')}
                </p>
              </div>

              <div className="library-action-buttons">
                <button
                  type="button"
                  onClick={() => void handleRenameSelected()}
                  disabled={!selectedAsset}
                  className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                >
                  {t('creative_library.rename')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDuplicateSelected()}
                  disabled={!selectedAsset}
                  className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                >
                  {t('creative_library.duplicate')}
                </button>
                <button
                  type="button"
                  onClick={handleOpenProperties}
                  disabled={!selectedAsset}
                  className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                >
                  {t('creative_library.properties')}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(selectFile(null))}
                  disabled={!selectedAsset}
                  className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                >
                  {t('creative_library.clear_selection')}
                </button>
              </div>
            </div>
          </FadeIn>

          {error ? (
            <StatusNotice
              className="mb-2"
              tone="error"
              title={t('creative_library.attention_required')}
              message={error}
              role="alert"
              aside={(
                <button
                  type="button"
                  onClick={() => dispatch(clearFilesError())}
                  className="btn-secondary px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  {t('creative_library.dismiss')}
                </button>
              )}
            />
          ) : null}
          {actionMessage ? (
            <StatusNotice
              className="mb-2"
              tone={actionMessage.type === 'success' ? 'success' : 'error'}
              title={actionMessage.type === 'success' ? 'Operacao concluida' : t('creative_library.attention_required')}
              message={actionMessage.text}
              role={actionMessage.type === 'success' ? 'status' : 'alert'}
            />
          ) : null}

          <FadeIn direction="up" delay={0.22}>
            <div className="focus:outline-none">
              <FileList
                activeFileId={selectedFileId}
                files={visibleFiles}
                selectedFileIds={selectedFileId ? [selectedFileId] : []}
                hasActiveFilters={hasActiveFilters}
                viewMode={viewMode}
                versioningByFileId={versioningByFileId}
                onSelectFile={(id) => dispatch(selectFile(id))}
              />
            </div>
          </FadeIn>
        </section>
      </main>

      <FadeIn direction="left" delay={0.28} className="library-detail-shell min-h-screen">
        <aside id="metadata-panel" tabIndex={-1} className="h-full focus:outline-none">
          <MetadataForm lockedTags={lockedTags} fetchContext={fetchContext} />
        </aside>
      </FadeIn>
    </div>
  )
}

export default CreativeLibraryWorkspace
