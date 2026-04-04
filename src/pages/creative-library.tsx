import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n/TranslationContext'

import { OfflineIndicator, Skeleton, FadeIn, BrandHealth, BrandLogo } from '@/components/atoms'
import { StatusNotice } from '@/components/molecules'

const FileList = dynamic(() => import('@/components/CreativeLibrary/FileList'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full rounded-2xl" />,
})

const MetadataForm = dynamic(() => import('@/components/CreativeLibrary/MetadataForm'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
})

import FileUploadInput from '@/components/CreativeLibrary/FileUploadInput'
import {
  filterAndSortFiles,
  type ViewMode,
} from '@/lib/creativeLibraryBrowser'
import {
  isActiveVersioningState,
} from '@/lib/versioning/presentation'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearFilesError, fetchFiles, selectFile } from '@/store/creativeLibrary/files.slice'
import { fetchVersioningStatus } from '@/store/creativeLibrary/versioning.slice'

const VIEW_MODE_STORAGE_KEY = 'brand-ops:creative-library:view-mode'

const CreativeLibraryPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { items, error, selectedFileId } = useAppSelector((state) => state.files)
  const versioningByFileId = useAppSelector((state) => state.versioning.byFileId)

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchFiles())
    dispatch(fetchVersioningStatus())
  }, [dispatch])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const persistedViewMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)

    if (persistedViewMode === 'grid' || persistedViewMode === 'list') {
      setViewMode(persistedViewMode)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

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
    () =>
      filterAndSortFiles(items, {
        searchTerm,
        typeFilter,
        statusFilter,
        sortOrder: 'newest',
      }),
    [items, searchTerm, statusFilter, typeFilter],
  )

  useEffect(() => {
    if (selectedFileId && !visibleFiles.some((file) => file.id === selectedFileId)) {
      dispatch(selectFile(null))
    }
  }, [dispatch, selectedFileId, visibleFiles])

  const handleFilesSelected = async (files: File[]) => {
    // In Story 0.1 we just handle the placeholder for the event
    console.log('Files selected:', files.length)
  }

  const handleFileSelection = (
    fileId: string
  ) => {
    dispatch(selectFile(fileId))
  }

  const selectedSummary = `${visibleFiles.length} ativos em vista`
  const activeVersionCount = Object.values(versioningByFileId).filter((state) => isActiveVersioningState(state)).length

  return (
    <div className="desktop-app-shell with-detail font-sans bg-surface-canvas/30">
      <nav
        className="desktop-sidebar border-r border-border/50 sticky top-0 h-screen"
        aria-label="Creative navigation shell"
      >
        <div className="flex items-center space-x-4">
          <div className="empty-state-icon mb-0 h-12 w-12 rounded-2xl text-xs tracking-[0.3em] bg-action-primary text-white shadow-lg shadow-action-primary/20">
            BO
          </div>
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight text-text">{t('app_name')}</h2>
            <p className="text-xs uppercase tracking-[0.25em] text-action-primary font-bold">Creative shell</p>
          </div>
        </div>

        <div className="desktop-sidebar-nav mt-4">
          <a href="#" className="desktop-nav-link desktop-nav-link-active shadow-md shadow-action-primary/10">
            <span>{t('navigation.dashboard')}</span>
          </a>
          <a href="#" className="desktop-nav-link">
            <span>{t('navigation.strategy')}</span>
          </a>
          <a href="#" className="desktop-nav-link">
            <span>{t('navigation.media')}</span>
          </a>
        </div>

        <div className="panel-shell p-6 mt-4">
          <h2 className="eyebrow-label text-action-primary/80">Status de Navegação</h2>
          <p className="mt-3 text-sm text-text font-medium">{selectedSummary}</p>
          <p className="mt-3 text-xs text-text-muted leading-relaxed">
            Funcionalidades básicas de gestão ativas para o Épico 1.
          </p>
          {activeVersionCount > 0 ? (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-status-info bg-status-info/5 p-2 rounded-lg border border-status-info/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-info opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-info"></span>
              </span>
              {activeVersionCount} processando versões
            </div>
          ) : null}
        </div>

        <div className="mt-auto border-t border-border/50 pt-8">
          <OfflineIndicator />
        </div>
      </nav>

      <main
        id="main-content"
        className="desktop-workspace p-8"
        aria-label="Creative library workspace"
      >
        <header className="workspace-header sticky top-0 z-40 mb-10 -mx-8 -mt-8 px-8 py-6 bg-surface/80 backdrop-blur-xl border-b border-border/50">
          <FadeIn direction="down">
            <div className="workspace-toolbar flex items-end justify-between">
              <div>
                <div className="eyebrow-label text-action-primary/60 tracking-[0.4em] mb-4 font-bold uppercase flex items-center gap-2">
                  <BrandLogo size={20} variant="solid" />
                  Mission: Intelligence Orbit
                </div>
                <h1 className="text-4xl font-display font-bold text-text tracking-tighter">{t('creative_library.title')}</h1>
                <p className="mt-2 text-sm text-text-muted max-w-md font-medium">
                  {t('creative_library.description')}
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/40">Nível Estratégico</span>
                  <BrandHealth score={42} size="md" label="" />
                </div>
                <div className="h-10 w-px bg-border/30" />
                <div className="summary-pill bg-surface-muted/50 border-border/50 px-5 py-2.5 font-bold text-xs uppercase tracking-widest text-text/60">
                  {selectedSummary}
                </div>
                <FileUploadInput onFilesSelected={handleFilesSelected} />
              </div>
            </div>

            <div className="filter-bar-grid mt-8">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold tracking-[0.25em]">Busca</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nome..."
                  className="input-field text-sm font-normal normal-case tracking-normal"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold tracking-[0.25em]">{t('metadata.asset_type')}</span>
                <select
                  aria-label="Library type filter"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="select-field text-sm font-normal normal-case tracking-normal"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="image">{t('metadata.types.image')}</option>
                  <option value="video">{t('metadata.types.video')}</option>
                  <option value="carousel">{t('metadata.types.carousel')}</option>
                  <option value="document">{t('metadata.types.document')}</option>
                  <option value="other">{t('metadata.types.other')}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold tracking-[0.25em]">Status</span>
                <select
                  aria-label="Library status filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="select-field text-sm font-normal normal-case tracking-normal"
                >
                  <option value="all">Todos os status</option>
                  <option value="Draft">{t('status.draft')}</option>
                  <option value="In Review">{t('status.in_review')}</option>
                  <option value="Approved">{t('status.approved')}</option>
                  <option value="Done">{t('status.done')}</option>
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="field-label mb-0 text-xs font-bold tracking-[0.25em]">Vista</span>
                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`segmented-control-button ${
                      viewMode === 'grid' ? 'segmented-control-button-active' : ''
                    }`}
                  >
                    Grade
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`segmented-control-button ${
                      viewMode === 'list' ? 'segmented-control-button-active' : ''
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </header>

        <FadeIn direction="up" delay={0.2} className="flex-1">
          <div className="workspace-scroll-region">
          {error ? (
            <StatusNotice
              className="mb-6"
              tone="error"
              title="Atenção necessária"
              message={error}
              role="alert"
              aside={(
                <button
                  type="button"
                  onClick={() => dispatch(clearFilesError())}
                  className="btn-secondary px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  Fechar
                </button>
              )}
            />
          ) : null}

          <div className="focus:outline-none">
            <FileList
              activeFileId={selectedFileId}
              files={visibleFiles}
              selectedFileIds={selectedFileId ? [selectedFileId] : []}
              viewMode={viewMode}
              versioningByFileId={versioningByFileId}
              onSelectFile={(id) => handleFileSelection(id)}
            />
          </div>
        </div>
      </FadeIn>
      </main>

      <FadeIn direction="left" delay={0.3} className="desktop-detail-panel h-screen overflow-y-auto sticky top-0">
        <aside className="focus:outline-none h-full">
          <MetadataForm />
        </aside>
      </FadeIn>
    </div>
  )
}

export default CreativeLibraryPage
