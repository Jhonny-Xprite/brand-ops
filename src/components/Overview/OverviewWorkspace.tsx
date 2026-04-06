import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { AppIcon, DomainIcon, FadeIn, MotionButton } from '@brand-ops/ui/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@brand-ops/ui/molecules'
import DialogShell from '@/components/organisms/DialogShell'
import type { ProjectLibraryDomain } from '@/lib/projectDomain'
import {
  getOverviewDomainLabel,
  OVERVIEW_DOMAIN_OPTIONS,
  type OverviewEntry,
  type OverviewSourceDomain,
} from '@/lib/overview'

interface OverviewWorkspaceProps {
  projectId: string
}

type ViewMode = 'grid' | 'list'

interface QuickCreateState {
  targetDomain: OverviewSourceDomain
  category: string
  title: string
  description: string
  content: string
  status: string
  assetType: string
  platform: string
  format: string
  angle: string
  audience: string
  placement: string
  campaign: string
  dueDate: string
  objective: string
  priority: string
  variant: string
  linkUrl: string
  file: File | null
}

const OVERVIEW_VIEW_STORAGE = 'brand-ops:overview:view-mode'

const DOMAIN_CATEGORY_MAP: Record<OverviewSourceDomain, string[]> = {
  MEDIA_LIBRARY: ['FOTOS', 'VIDEOS'],
  STRATEGY: ['PRODUTOS', 'OFERTAS', 'PUBLICOS', 'FUNIS', 'CAMPANHAS'],
  BRAND_CORE: ['LOGOTIPOS', 'TIPOGRAFIA', 'PALETA_DE_CORES', 'ELEMENTOS_VISUAIS', 'MANUAL_DE_MARCA'],
  SOCIAL_ASSETS: ['FOTOS_DE_PERFIL', 'CAPAS', 'DESTAQUES'],
  CREATIVE_PRODUCTION: ['ESTATICOS', 'VIDEOS', 'CARROSSEIS', 'VSLS', 'LIVES'],
  COPY_MESSAGING: ['COPYS_DE_ANUNCIOS', 'HEADLINES', 'SCRIPTS_ROTEIROS', 'NOTIFICACOES', 'BIG_IDEAS'],
}

function createInitialQuickCreate(targetDomain: OverviewSourceDomain = 'MEDIA_LIBRARY'): QuickCreateState {
  return {
    targetDomain,
    category: DOMAIN_CATEGORY_MAP[targetDomain][0] ?? '',
    title: '',
    description: '',
    content: '',
    status: 'Draft',
    assetType: targetDomain === 'MEDIA_LIBRARY' ? 'image' : '',
    platform: 'Instagram',
    format: '',
    angle: '',
    audience: '',
    placement: '',
    campaign: '',
    dueDate: '',
    objective: '',
    priority: 'Media',
    variant: '',
    linkUrl: '',
    file: null,
  }
}

function getDomainIconName(domain: OverviewSourceDomain) {
  switch (domain) {
    case 'STRATEGY':
      return 'STRATEGY'
    case 'BRAND_CORE':
      return 'BRAND_CORE'
    case 'SOCIAL_ASSETS':
      return 'SOCIAL'
    case 'CREATIVE_PRODUCTION':
      return 'PRODUCTION'
    case 'COPY_MESSAGING':
      return 'COPY'
    case 'MEDIA_LIBRARY':
    default:
      return 'MEDIA'
  }
}

export function OverviewWorkspace({ projectId }: OverviewWorkspaceProps) {
  const router = useRouter()
  const [entries, setEntries] = useState<OverviewEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<'ALL' | OverviewSourceDomain>('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [kindFilter, setKindFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [withAsset, setWithAsset] = useState(false)
  const [withRelations, setWithRelations] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [quickCreate, setQuickCreate] = useState<QuickCreateState>(() => createInitialQuickCreate())
  const [inlineDraft, setInlineDraft] = useState<{
    title: string
    description: string
    content: string
    status: string
    category: string
  } | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projeto/${projectId}/overview`)
      if (!response.ok) {
        throw new Error('Nao foi possivel carregar o overview do projeto.')
      }

      const result = (await response.json()) as { items: OverviewEntry[] }
      setEntries(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o overview do projeto.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedView = window.localStorage.getItem(OVERVIEW_VIEW_STORAGE)
    if (storedView === 'grid' || storedView === 'list') {
      setViewMode(storedView)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(OVERVIEW_VIEW_STORAGE, viewMode)
  }, [viewMode])

  const domainOptions = useMemo(() => OVERVIEW_DOMAIN_OPTIONS, [])

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    entries.forEach((entry) => {
      if (domainFilter === 'ALL' || entry.sourceDomain === domainFilter) {
        categories.add(entry.category)
      }
    })
    return Array.from(categories).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [domainFilter, entries])

  const statusOptions = useMemo(() => {
    const statuses = new Set(entries.map((entry) => entry.status))
    return Array.from(statuses).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [entries])

  const kindOptions = useMemo(() => {
    const kinds = new Set(entries.map((entry) => entry.kind))
    return Array.from(kinds).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [entries])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesDomain = domainFilter === 'ALL' || entry.sourceDomain === domainFilter
      const matchesCategory = categoryFilter === 'ALL' || entry.category === categoryFilter
      const matchesStatus = statusFilter === 'ALL' || entry.status === statusFilter
      const matchesKind = kindFilter === 'ALL' || entry.kind === kindFilter
      const matchesAsset = !withAsset || Boolean(entry.previewUrl || entry.filename)
      const matchesRelations = !withRelations || entry.relations.length > 0
      const matchesSearch =
        !normalizedSearch ||
        [
          entry.title,
          entry.description,
          entry.filename,
          entry.category,
          getOverviewDomainLabel(entry.sourceDomain),
          ...(entry.tags ?? []),
          ...Object.values(entry.payload).flatMap((value) => (Array.isArray(value) ? value : [value])),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return (
        matchesDomain &&
        matchesCategory &&
        matchesStatus &&
        matchesKind &&
        matchesAsset &&
        matchesRelations &&
        matchesSearch
      )
    })
  }, [categoryFilter, domainFilter, entries, kindFilter, search, statusFilter, withAsset, withRelations])

  const selectedEntry = useMemo(
    () =>
      filteredEntries.find((entry) => entry.id === selectedEntryId) ??
      entries.find((entry) => entry.id === selectedEntryId) ??
      null,
    [entries, filteredEntries, selectedEntryId],
  )

  useEffect(() => {
    if (!selectedEntry) {
      setInlineDraft(null)
      return
    }

    setInlineDraft({
      title: selectedEntry.title,
      description: selectedEntry.description ?? '',
      content: String(selectedEntry.payload.content ?? ''),
      status: selectedEntry.status,
      category: selectedEntry.category,
    })
  }, [selectedEntry])

  const overviewMetrics = useMemo(() => {
    const domainsInView = new Set(filteredEntries.map((entry) => entry.sourceDomain)).size
    const pendingItems = filteredEntries.filter((entry) => entry.status !== 'Approved' && entry.status !== 'Done').length

    return {
      total: filteredEntries.length,
      domains: domainsInView,
      pending: pendingItems,
    }
  }, [filteredEntries])

  const handleOpenOrigin = () => {
    if (!selectedEntry) {
      return
    }

    void router.push(selectedEntry.originHref)
  }

  const handleRenameSelected = async () => {
    if (!selectedEntry) {
      return
    }

    const nextTitle = window.prompt('Novo nome para a peca selecionada:', selectedEntry.title)
    if (!nextTitle?.trim()) {
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      if (selectedEntry.sourceType === 'FILE') {
        const filenameBase = nextTitle.replace(/\.[^/.]+$/, '')
        const response = await fetch(`/api/files/${selectedEntry.id}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rename', filenameBase }),
        })
        const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel renomear esta peca.' }))) as {
          error?: string
          message?: string
        }
        if (!response.ok) {
          throw new Error(payload.error || 'Nao foi possivel renomear esta peca.')
        }
        setMessage({ type: 'success', text: payload.message || 'Peca renomeada com sucesso.' })
      } else {
        const response = await fetch(`/api/projeto/${projectId}/overview/${selectedEntry.id}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rename', title: nextTitle }),
        })
        const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel renomear esta peca.' }))) as {
          error?: string
          message?: string
        }
        if (!response.ok) {
          throw new Error(payload.error || 'Nao foi possivel renomear esta peca.')
        }
        setMessage({ type: 'success', text: payload.message || 'Peca renomeada com sucesso.' })
      }

      await loadEntries()
    } catch (renameError) {
      setMessage({
        type: 'error',
        text: renameError instanceof Error ? renameError.message : 'Nao foi possivel renomear esta peca.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicateSelected = async () => {
    if (!selectedEntry) {
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      if (selectedEntry.sourceType === 'FILE') {
        const response = await fetch(`/api/files/${selectedEntry.id}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'duplicate' }),
        })
        const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel duplicar esta peca.' }))) as {
          error?: string
          message?: string
        }
        if (!response.ok) {
          throw new Error(payload.error || 'Nao foi possivel duplicar esta peca.')
        }
        setMessage({ type: 'success', text: payload.message || 'Peca duplicada com sucesso.' })
      } else {
        const response = await fetch(`/api/projeto/${projectId}/overview/${selectedEntry.id}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'duplicate' }),
        })
        const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel duplicar esta peca.' }))) as {
          error?: string
          message?: string
        }
        if (!response.ok) {
          throw new Error(payload.error || 'Nao foi possivel duplicar esta peca.')
        }
        setMessage({ type: 'success', text: payload.message || 'Peca duplicada com sucesso.' })
      }

      await loadEntries()
    } catch (duplicateError) {
      setMessage({
        type: 'error',
        text: duplicateError instanceof Error ? duplicateError.message : 'Nao foi possivel duplicar esta peca.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInline = async () => {
    if (!selectedEntry || !inlineDraft || selectedEntry.sourceType !== 'LIBRARY_ITEM') {
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/projeto/${projectId}/overview/${selectedEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'LIBRARY_ITEM',
          domain: selectedEntry.sourceDomain as ProjectLibraryDomain,
          title: inlineDraft.title,
          description: inlineDraft.description,
          category: inlineDraft.category,
          status: inlineDraft.status,
          payload: {
            ...selectedEntry.payload,
            content: inlineDraft.content,
          },
        }),
      })
      const payload = (await response.json().catch(() => ({ error: 'Nao foi possivel salvar esta peca.' }))) as {
        error?: string
      }
      if (!response.ok) {
        throw new Error(payload.error || 'Nao foi possivel salvar esta peca.')
      }
      setMessage({ type: 'success', text: 'Peca atualizada no overview.' })
      await loadEntries()
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar esta peca.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!quickCreate.category || (quickCreate.targetDomain !== 'MEDIA_LIBRARY' && !quickCreate.title.trim())) {
      setMessage({ type: 'error', text: 'Preencha ao menos categoria e titulo para criar a peca.' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      let assetFileId: string | undefined

      if (quickCreate.file) {
        const formData = new FormData()
        formData.append('file', quickCreate.file)
        formData.append('projectId', projectId)
        formData.append(
          'scope',
          quickCreate.targetDomain === 'MEDIA_LIBRARY'
            ? 'media'
            : quickCreate.targetDomain === 'BRAND_CORE'
              ? 'brand-core'
              : quickCreate.targetDomain === 'SOCIAL_ASSETS'
                ? 'social-assets'
                : quickCreate.targetDomain === 'CREATIVE_PRODUCTION'
                  ? 'creative-production'
                  : quickCreate.targetDomain === 'COPY_MESSAGING'
                    ? 'copy-messaging'
                    : 'strategy',
        )
        const uploadResponse = await fetch('/api/files/upload', { method: 'POST', body: formData })
        const uploadPayload = (await uploadResponse.json().catch(() => ({ error: 'Nao foi possivel enviar o arquivo.' }))) as {
          error?: string
          file?: { id: string }
        }
        if (!uploadResponse.ok || !uploadPayload.file) {
          throw new Error(uploadPayload.error || 'Nao foi possivel enviar o arquivo.')
        }
        assetFileId = uploadPayload.file.id
      }

      const payload: Record<string, string> = {}
      if (quickCreate.targetDomain === 'MEDIA_LIBRARY') payload.type = quickCreate.assetType
      if (quickCreate.targetDomain === 'STRATEGY') {
        payload.objective = quickCreate.objective
        payload.priority = quickCreate.priority
      }
      if (quickCreate.targetDomain === 'BRAND_CORE') payload.variant = quickCreate.variant
      if (quickCreate.targetDomain === 'SOCIAL_ASSETS') {
        payload.platform = quickCreate.platform
        payload.format = quickCreate.format
      }
      if (quickCreate.targetDomain === 'CREATIVE_PRODUCTION') {
        payload.placement = quickCreate.placement
        payload.campaign = quickCreate.campaign
        payload.dueDate = quickCreate.dueDate
      }
      if (quickCreate.targetDomain === 'COPY_MESSAGING') {
        payload.angle = quickCreate.angle
        payload.audience = quickCreate.audience
      }

      const response = await fetch(`/api/projeto/${projectId}/overview/quick-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDomain: quickCreate.targetDomain,
          category: quickCreate.category,
          title: quickCreate.targetDomain === 'MEDIA_LIBRARY' ? quickCreate.file?.name ?? 'Novo asset de media' : quickCreate.title,
          description: quickCreate.description,
          content: quickCreate.content,
          status: quickCreate.status,
          payload,
          assetFileId,
          linkUrl: quickCreate.linkUrl,
        }),
      })
      const responsePayload = (await response.json().catch(() => ({ error: 'Nao foi possivel criar a peca.' }))) as {
        error?: string
      }
      if (!response.ok) {
        throw new Error(responsePayload.error || 'Nao foi possivel criar a peca.')
      }

      setMessage({ type: 'success', text: 'Nova peca criada com sucesso no overview.' })
      setQuickCreateOpen(false)
      setQuickCreate(createInitialQuickCreate())
      await loadEntries()
    } catch (quickCreateError) {
      setMessage({
        type: 'error',
        text: quickCreateError instanceof Error ? quickCreateError.message : 'Nao foi possivel criar a peca.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProjectLayout projectId={projectId}>
      <div className="space-y-8 px-6">
        <FadeIn direction="down">
          <ProjectWorkspaceHero
            eyebrow="Mission control"
            title="OVERVIEW"
            description="Hub transversal para localizar, filtrar, selecionar e criar qualquer peca do projeto a partir de uma unica superficie operacional."
            actions={(
              <MotionButton
                onClick={() => {
                  setQuickCreate(createInitialQuickCreate())
                  setQuickCreateOpen(true)
                }}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
              >
                <AppIcon name="create" size="sm" decorative />
                Adicionar peca
              </MotionButton>
            )}
            metrics={(
              <>
                <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                  {overviewMetrics.total} peca(s) em vista
                </span>
                <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                  {overviewMetrics.domains} dominio(s) ativo(s)
                </span>
                <span className="summary-pill border-status-warning/30 bg-status-warning/10 text-status-warning">
                  {overviewMetrics.pending} pendente(s)
                </span>
              </>
            )}
          />
        </FadeIn>

        {error ? <StatusNotice tone="error" title="Overview indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Overview atualizado' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="panel-shell p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(150px,1fr))]">
            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Busca global</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <AppIcon name="search" size="sm" tone="muted" decorative />
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="input-field pl-11"
                  placeholder="Buscar por nome, categoria, dominio ou payload"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Dominio</span>
              <select value={domainFilter} onChange={(event) => setDomainFilter(event.target.value as 'ALL' | OverviewSourceDomain)} className="select-field">
                {domainOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Categoria</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="select-field">
                <option value="ALL">Todas</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="select-field">
                <option value="ALL">Todos</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Tipo</span>
              <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} className="select-field">
                <option value="ALL">Todos</option>
                {kindOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                <input type="checkbox" checked={withAsset} onChange={(event) => setWithAsset(event.target.checked)} className="mr-2" />
                Somente com asset
              </label>
              <label className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                <input type="checkbox" checked={withRelations} onChange={(event) => setWithRelations(event.target.checked)} className="mr-2" />
                Somente relacionados
              </label>
            </div>

            <div className="segmented-control">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`segmented-control-button ${viewMode === 'grid' ? 'segmented-control-button-active' : ''}`}
              >
                Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`segmented-control-button ${viewMode === 'list' ? 'segmented-control-button-active' : ''}`}
              >
                Lista
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <FadeIn direction="up" delay={0.12}>
              <div className="library-action-bar">
                <div className="library-action-copy">
                  <div className="eyebrow-label text-text-muted">Overview actions</div>
                  <p className="mt-3 text-lg font-semibold text-text">
                    {selectedEntry ? `Peca selecionada: ${selectedEntry.title}` : 'Selecione uma peca para liberar acoes'}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Renomeie, duplique, abra no dominio de origem ou refine a categoria sem sair do hub.
                  </p>
                </div>

                <div className="library-action-buttons">
                  <button
                    type="button"
                    onClick={() => void handleRenameSelected()}
                    disabled={!selectedEntry || saving}
                    className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                  >
                    <span className="inline-flex items-center gap-2">
                      <AppIcon name="properties" size="sm" decorative />
                      Renomear
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDuplicateSelected()}
                    disabled={!selectedEntry || saving}
                    className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                  >
                    <span className="inline-flex items-center gap-2">
                      <AppIcon name="duplicate" size="sm" decorative />
                      Duplicar
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenOrigin}
                    disabled={!selectedEntry}
                    className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                  >
                    Abrir origem
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEntryId(null)}
                    disabled={!selectedEntry}
                    className="btn-ghost border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-text disabled:opacity-45"
                  >
                    Limpar selecao
                  </button>
                </div>
              </div>
            </FadeIn>

            {loading ? (
              <div className="empty-state min-h-[320px] gap-4 px-6 py-12">
                <div className="empty-state-icon animate-pulse">OV</div>
                <h2 className="text-2xl font-display font-bold text-text">Carregando overview</h2>
                <p className="max-w-md text-center text-text-muted">
                  Estamos consolidando media, estrategia, identidade, social, criativos e copy em uma unica visao.
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="empty-state min-h-[320px] gap-4 px-6 py-12">
                <div className="empty-state-icon">OV</div>
                <h2 className="text-2xl font-display font-bold text-text">Nenhuma peca encontrada</h2>
                <p className="max-w-xl text-center text-text-muted">
                  O overview centraliza tudo o que existe no projeto. Comece subindo midia, criando um bloco estrategico ou registrando identidade de marca.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <MotionButton variant="secondary" onClick={() => {
                    setQuickCreate(createInitialQuickCreate('MEDIA_LIBRARY'))
                    setQuickCreateOpen(true)
                  }}>
                    Subir midia
                  </MotionButton>
                  <MotionButton variant="secondary" onClick={() => {
                    setQuickCreate(createInitialQuickCreate('STRATEGY'))
                    setQuickCreateOpen(true)
                  }}>
                    Criar estrategia
                  </MotionButton>
                  <MotionButton onClick={() => {
                    setQuickCreate(createInitialQuickCreate('BRAND_CORE'))
                    setQuickCreateOpen(true)
                  }}>
                    Registrar identidade
                  </MotionButton>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEntries.map((entry) => (
                  <button
                    key={`${entry.sourceType}-${entry.id}`}
                    type="button"
                    onClick={() => setSelectedEntryId(entry.id)}
                    className={`panel-shell overflow-hidden p-0 text-left transition-all hover:-translate-y-0.5 hover:border-action-primary/20 ${selectedEntryId === entry.id ? 'border-action-primary/30 ring-2 ring-action-primary/15' : ''}`}
                  >
                    <div className="border-b border-border/60 bg-gradient-to-r from-action-primary/10 via-transparent to-action-secondary/10 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="summary-pill border-border/60 bg-surface/70 text-text-muted">
                          <span className="inline-flex items-center gap-2">
                            <DomainIcon domain={getDomainIconName(entry.sourceDomain)} size="sm" tone="active" />
                            {getOverviewDomainLabel(entry.sourceDomain)}
                          </span>
                        </span>
                        <span className="summary-pill border-border/60 bg-surface/70 text-text-muted">{entry.status}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      {entry.previewUrl ? (
                        <div className="mb-4 overflow-hidden rounded-[1.35rem] border border-border/60 bg-surface-muted/20">
                          <img src={entry.previewUrl} alt={entry.title} className="h-44 w-full object-cover" />
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                          {entry.category}
                        </span>
                        <span className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                          {entry.kind}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-display font-bold text-text">{entry.title}</h3>
                      <p className="mt-3 text-sm text-text-muted">
                        {entry.description || 'Sem resumo registrado ainda.'}
                      </p>

                      {entry.relations.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {entry.relations.slice(0, 3).map((relation) => (
                            <span key={relation.id} className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                              {relation.targetTitle}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="panel-shell overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-border/60 bg-surface-muted/30">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Dominio</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Peca</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Categoria</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Status</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr
                        key={`${entry.sourceType}-${entry.id}`}
                        onClick={() => setSelectedEntryId(entry.id)}
                        className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-surface-muted/20 ${selectedEntryId === entry.id ? 'bg-action-primary/5' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-text">
                            <DomainIcon domain={getDomainIconName(entry.sourceDomain)} size="sm" tone="active" />
                            {getOverviewDomainLabel(entry.sourceDomain)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-text">{entry.title}</td>
                        <td className="px-5 py-4 text-sm text-text-muted">{entry.category}</td>
                        <td className="px-5 py-4 text-sm text-text-muted">{entry.status}</td>
                        <td className="px-5 py-4 text-sm text-action-primary">Abrir dominio</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="panel-shell sticky top-8 h-fit p-6">
            <div>
              <p className="eyebrow-label text-action-primary/70">Detail pane</p>
              <h2 className="mt-3 text-xl font-display font-bold text-text">
                {selectedEntry ? selectedEntry.title : 'Selecione uma peca'}
              </h2>
              <p className="mt-3 text-sm text-text-muted">
                {selectedEntry
                  ? 'Inspecione a origem, relacoes e metadados principais desta peca antes de seguir para o dominio correto.'
                  : 'O painel lateral mostra relacoes, metadados e acoes rapidas quando uma peca e selecionada.'}
              </p>
            </div>

            {selectedEntry && inlineDraft ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-3xl border border-border/60 bg-surface-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                      <span className="inline-flex items-center gap-2">
                        <DomainIcon domain={getDomainIconName(selectedEntry.sourceDomain)} size="sm" tone="active" />
                        {getOverviewDomainLabel(selectedEntry.sourceDomain)}
                      </span>
                    </span>
                    <span className="summary-pill border-border/60 bg-surface/70 text-text-muted">{selectedEntry.kind}</span>
                  </div>
                  {selectedEntry.previewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-border/60 bg-surface">
                      <img src={selectedEntry.previewUrl} alt={selectedEntry.title} className="h-40 w-full object-cover" />
                    </div>
                  ) : null}
                </div>

                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Titulo</span>
                  <input
                    value={inlineDraft.title}
                    onChange={(event) => setInlineDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                    className="input-field"
                    disabled={selectedEntry.sourceType === 'FILE'}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="field-label mb-0">Categoria</span>
                    <select
                      value={inlineDraft.category}
                      onChange={(event) => setInlineDraft((current) => (current ? { ...current, category: event.target.value } : current))}
                      className="select-field"
                      disabled={selectedEntry.sourceType === 'FILE'}
                    >
                      {(DOMAIN_CATEGORY_MAP[selectedEntry.sourceDomain] ?? [selectedEntry.category]).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="field-label mb-0">Status</span>
                    <select
                      value={inlineDraft.status}
                      onChange={(event) => setInlineDraft((current) => (current ? { ...current, status: event.target.value } : current))}
                      className="select-field"
                      disabled={selectedEntry.sourceType === 'FILE'}
                    >
                      {['Draft', 'In Review', 'Approved', 'Done'].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Resumo</span>
                  <textarea
                    value={inlineDraft.description}
                    onChange={(event) => setInlineDraft((current) => (current ? { ...current, description: event.target.value } : current))}
                    className="textarea-field min-h-[120px]"
                    disabled={selectedEntry.sourceType === 'FILE'}
                  />
                </label>

                {selectedEntry.sourceType === 'LIBRARY_ITEM' ? (
                  <label className="flex flex-col gap-2">
                    <span className="field-label mb-0">Conteudo rapido</span>
                    <textarea
                      value={inlineDraft.content}
                      onChange={(event) => setInlineDraft((current) => (current ? { ...current, content: event.target.value } : current))}
                      className="textarea-field min-h-[160px]"
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-border/60 bg-surface-muted/20 px-4 py-4 text-sm text-text-muted">
                    Edicao inline completa de media continua na <strong>Media Library</strong>. Aqui no overview voce ganha busca, contexto e acoes rapidas.
                  </div>
                )}

                {selectedEntry.relations.length > 0 ? (
                  <div className="space-y-3 rounded-3xl border border-border/60 bg-surface-muted/20 p-4">
                    <p className="field-label mb-0">Relacoes principais</p>
                    {selectedEntry.relations.map((relation) => (
                      <div key={relation.id} className="rounded-2xl border border-border/50 bg-surface px-4 py-3">
                        <p className="text-sm font-semibold text-text">{relation.targetTitle}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted">
                          {relation.relationType} • {relation.targetCategory}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <MotionButton
                    variant="secondary"
                    onClick={handleOpenOrigin}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-[0.22em]"
                  >
                    Abrir dominio
                  </MotionButton>
                  {selectedEntry.sourceType === 'LIBRARY_ITEM' ? (
                    <MotionButton
                      onClick={() => void handleSaveInline()}
                      disabled={saving}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
                    >
                      {saving ? 'Salvando...' : 'Salvar rapido'}
                    </MotionButton>
                  ) : null}
                </div>
              </div>
            ) : null}
          </aside>
        </section>
      </div>

      {quickCreateOpen ? (
        <DialogShell
          eyebrow="Quick create central"
          title="Adicionar nova peca ao projeto"
          titleId="overview-quick-create"
          onClose={() => setQuickCreateOpen(false)}
          closeLabel="Fechar"
          actions={(
            <>
              <MotionButton variant="secondary" onClick={() => setQuickCreateOpen(false)} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.22em]">
                Cancelar
              </MotionButton>
              <MotionButton onClick={() => void handleQuickCreate()} disabled={saving} className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]">
                {saving ? 'Criando...' : 'Criar peca'}
              </MotionButton>
            </>
          )}
        >
          <div className="space-y-5">
            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Dominio</span>
              <select
                value={quickCreate.targetDomain}
                onChange={(event) => {
                  const nextDomain = event.target.value as OverviewSourceDomain
                  setQuickCreate(createInitialQuickCreate(nextDomain))
                }}
                className="select-field"
              >
                {domainOptions
                  .filter((option) => option.value !== 'ALL')
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Categoria</span>
                <select
                  value={quickCreate.category}
                  onChange={(event) => setQuickCreate((current) => ({ ...current, category: event.target.value }))}
                  className="select-field"
                >
                  {(DOMAIN_CATEGORY_MAP[quickCreate.targetDomain] ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Status</span>
                <select
                  value={quickCreate.status}
                  onChange={(event) => setQuickCreate((current) => ({ ...current, status: event.target.value }))}
                  className="select-field"
                >
                  {['Draft', 'In Review', 'Approved', 'Done'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {quickCreate.targetDomain !== 'MEDIA_LIBRARY' ? (
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Titulo</span>
                <input
                  value={quickCreate.title}
                  onChange={(event) => setQuickCreate((current) => ({ ...current, title: event.target.value }))}
                  className="input-field"
                />
              </label>
            ) : null}

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Resumo</span>
              <textarea
                value={quickCreate.description}
                onChange={(event) => setQuickCreate((current) => ({ ...current, description: event.target.value }))}
                className="textarea-field min-h-[120px]"
              />
            </label>

            {quickCreate.targetDomain !== 'MEDIA_LIBRARY' ? (
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Conteudo / observacao</span>
                <textarea
                  value={quickCreate.content}
                  onChange={(event) => setQuickCreate((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field min-h-[140px]"
                />
              </label>
            ) : null}

            {quickCreate.targetDomain === 'STRATEGY' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Objetivo</span>
                  <input
                    value={quickCreate.objective}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, objective: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Prioridade</span>
                  <select
                    value={quickCreate.priority}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, priority: event.target.value }))}
                    className="select-field"
                  >
                    {['Baixa', 'Media', 'Alta', 'Critica'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {quickCreate.targetDomain === 'BRAND_CORE' ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Variacao / uso</span>
                  <input
                    value={quickCreate.variant}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, variant: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Link opcional</span>
                  <input
                    value={quickCreate.linkUrl}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, linkUrl: event.target.value }))}
                    className="input-field"
                    placeholder="https://..."
                  />
                </label>
              </>
            ) : null}

            {quickCreate.targetDomain === 'SOCIAL_ASSETS' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Plataforma</span>
                  <select
                    value={quickCreate.platform}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, platform: event.target.value }))}
                    className="select-field"
                  >
                    {['Instagram', 'Facebook', 'YouTube', 'TikTok', 'LinkedIn'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Formato</span>
                  <input
                    value={quickCreate.format}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, format: event.target.value }))}
                    className="input-field"
                    placeholder="1:1, 16:9, 9:16"
                  />
                </label>
              </div>
            ) : null}

            {quickCreate.targetDomain === 'CREATIVE_PRODUCTION' ? (
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Placement</span>
                  <input
                    value={quickCreate.placement}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, placement: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Campanha</span>
                  <input
                    value={quickCreate.campaign}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, campaign: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Prazo</span>
                  <input
                    type="date"
                    value={quickCreate.dueDate}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, dueDate: event.target.value }))}
                    className="input-field"
                  />
                </label>
              </div>
            ) : null}

            {quickCreate.targetDomain === 'COPY_MESSAGING' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Angulo</span>
                  <input
                    value={quickCreate.angle}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, angle: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Audiencia</span>
                  <input
                    value={quickCreate.audience}
                    onChange={(event) => setQuickCreate((current) => ({ ...current, audience: event.target.value }))}
                    className="input-field"
                  />
                </label>
              </div>
            ) : null}

            {quickCreate.targetDomain === 'MEDIA_LIBRARY' ? (
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Tipo principal</span>
                <select
                  value={quickCreate.assetType}
                  onChange={(event) => setQuickCreate((current) => ({ ...current, assetType: event.target.value }))}
                  className="select-field"
                >
                  <option value="image">Imagem</option>
                  <option value="video">Video</option>
                  <option value="carousel">Carrossel</option>
                  <option value="document">Documento</option>
                </select>
              </label>
            ) : null}

            <label className="flex flex-col gap-2">
              <span className="field-label mb-0">Arquivo</span>
              <input
                type="file"
                onChange={(event) => setQuickCreate((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
                className="input-field file:mr-4 file:rounded-xl file:border-0 file:bg-action-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.18em] file:text-action-primary"
              />
            </label>
          </div>
        </DialogShell>
      ) : null}
    </ProjectLayout>
  )
}

export default OverviewWorkspace
