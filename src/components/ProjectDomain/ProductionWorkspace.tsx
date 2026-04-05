import { useEffect, useMemo, useState } from 'react'

import { MotionButton } from '@/components/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@/components/molecules'
import type { SerializedProjectLibraryItem } from '@/lib/projectDomain'

import { useProjectDomainLibrary } from './useProjectDomainLibrary'

interface ProductionWorkspaceProps {
  projectId: string
}

const PRODUCTION_CATEGORIES = [
  { key: 'ESTATICOS', label: 'Estaticos' },
  { key: 'VIDEOS', label: 'Videos' },
  { key: 'CARROSSEIS', label: 'Carrosseis' },
  { key: 'VSLS', label: 'VSLs' },
  { key: 'LIVES', label: 'Lives' },
] as const

const PRODUCTION_STAGES = [
  { key: 'Briefing', label: 'Briefing' },
  { key: 'Em Producao', label: 'Em producao' },
  { key: 'Em Revisao', label: 'Em revisao' },
  { key: 'Approved', label: 'Aprovado' },
  { key: 'Done', label: 'Entregue' },
] as const

interface ProductionFormState {
  id?: string
  category: string
  title: string
  description: string
  status: string
  placement: string
  campaign: string
  dueDate: string
  reviewer: string
  content: string
  assetFile: File | null
  assetFileId?: string | null
  strategyItemId: string
  copyItemId: string
}

function createInitialState(): ProductionFormState {
  return {
    category: PRODUCTION_CATEGORIES[0].key,
    title: '',
    description: '',
    status: 'Briefing',
    placement: '',
    campaign: '',
    dueDate: '',
    reviewer: '',
    content: '',
    assetFile: null,
    assetFileId: null,
    strategyItemId: '',
    copyItemId: '',
  }
}

function mapItemToForm(item: SerializedProjectLibraryItem): ProductionFormState {
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description ?? '',
    status: item.status,
    placement: String(item.payload.placement ?? ''),
    campaign: String(item.payload.campaign ?? ''),
    dueDate: String(item.payload.dueDate ?? ''),
    reviewer: String(item.payload.reviewer ?? ''),
    content: item.content ?? '',
    assetFile: null,
    assetFileId: item.assetFileId ?? null,
    strategyItemId: item.relatedItems.find((relation) => relation.relationType === 'DRIVES')?.targetItemId ?? '',
    copyItemId: item.relatedItems.find((relation) => relation.relationType === 'USES')?.targetItemId ?? '',
  }
}

export function ProductionWorkspace({ projectId }: ProductionWorkspaceProps) {
  const { items, allItems, loading, saving, error, saveItem, deleteItem } = useProjectDomainLibrary(projectId, 'CREATIVE_PRODUCTION')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<ProductionFormState>(createInitialState)

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const strategyItems = useMemo(
    () => allItems.filter((item) => item.domain === 'STRATEGY'),
    [allItems],
  )

  const copyItems = useMemo(
    () => allItems.filter((item) => item.domain === 'COPY_MESSAGING'),
    [allItems],
  )

  const itemsByStage = useMemo(() => {
    return PRODUCTION_STAGES.map((stage) => ({
      ...stage,
      items: items.filter((item) => item.status === stage.key),
    }))
  }, [items])

  useEffect(() => {
    if (selectedItem) {
      setForm(mapItemToForm(selectedItem))
    } else {
      setForm(createInitialState())
    }
  }, [selectedItem])

  const handleSave = async () => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Defina um nome para esta entrega criativa.' })
      return
    }

    try {
      await saveItem({
        id: form.id,
        category: form.category,
        title: form.title,
        description: form.description,
        content: form.content,
        status: form.status,
        assetFile: form.assetFile,
        assetFileId: form.assetFileId,
        payload: {
          placement: form.placement,
          campaign: form.campaign,
          dueDate: form.dueDate,
          reviewer: form.reviewer,
        },
        relationTargets: [
          ...(form.strategyItemId
            ? [{ targetItemId: form.strategyItemId, relationType: 'DRIVES' as const }]
            : []),
          ...(form.copyItemId ? [{ targetItemId: form.copyItemId, relationType: 'USES' as const }] : []),
        ],
      })
      setMessage({ type: 'success', text: form.id ? 'Entrega criativa atualizada.' : 'Entrega criativa criada.' })
      setSelectedItemId(null)
      setForm(createInitialState())
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar esta entrega criativa.',
      })
    }
  }

  const handleDelete = async () => {
    if (!form.id) {
      return
    }

    try {
      await deleteItem(form.id)
      setMessage({ type: 'success', text: 'Entrega criativa removida.' })
      setSelectedItemId(null)
    } catch (deleteError) {
      setMessage({
        type: 'error',
        text: deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover esta entrega.',
      })
    }
  }

  return (
    <ProjectLayout projectId={projectId}>
      <div className="space-y-8 px-6">
        <ProjectWorkspaceHero
          eyebrow="Pipeline criativo"
          title="CREATIVE PRODUCTION"
          description="Transforme criativos em um fluxo operacional real, com briefing, prioridade, aprovacao e ligacao direta com estrategia e copy."
          actions={(
            <MotionButton
              onClick={() => {
                setSelectedItemId(null)
                setForm(createInitialState())
              }}
              className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
            >
              Nova entrega
            </MotionButton>
          )}
          metrics={(
            <>
              <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                {items.length} entregas no pipeline
              </span>
              <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                Workflow por estagio
              </span>
            </>
          )}
        />

        {error ? <StatusNotice tone="error" title="Production indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Pipeline atualizado' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.9fr)]">
          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-5">
              {itemsByStage.map((stage) => (
                <section key={stage.key} className="panel-shell min-h-[240px] p-4">
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <p className="text-sm font-display font-bold text-text">{stage.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted">
                        {stage.items.length} item(ns)
                      </p>
                    </div>
                    <span className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                      {stage.items.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {loading && stage.key === 'Briefing' ? (
                      <div className="text-sm text-text-muted">Carregando pipeline...</div>
                    ) : stage.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/50 bg-surface-muted/10 px-4 py-6 text-sm text-text-muted">
                        Nenhuma entrega neste estagio.
                      </div>
                    ) : (
                      stage.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItemId(item.id)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition-all hover:border-action-primary/20 hover:bg-surface-muted/20 ${selectedItemId === item.id ? 'border-action-primary/30 bg-action-primary/5' : 'border-border/50 bg-surface/50'}`}
                        >
                          <span className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                            {item.category}
                          </span>
                          <h3 className="mt-3 text-sm font-semibold text-text">{item.title}</h3>
                          <p className="mt-2 text-xs text-text-muted">
                            {String(item.payload.placement ?? 'Placement pendente')}
                          </p>
                          {item.relatedItems.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.relatedItems.map((relation) => (
                                <span key={relation.id} className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                                  {relation.targetTitle}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </button>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="panel-shell sticky top-8 h-fit p-6">
            <div>
              <p className="eyebrow-label text-action-primary/70">Production editor</p>
              <h2 className="mt-3 text-xl font-display font-bold text-text">
                {form.id ? 'Atualizar entrega' : 'Nova entrega'}
              </h2>
              <p className="mt-3 text-sm text-text-muted">
                Cada entrega deve nascer com contexto, dependencia estrategica, copy relacionada e status claro.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Categoria</span>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="select-field"
                  >
                    {PRODUCTION_CATEGORIES.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Estagio</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    className="select-field"
                  >
                    {PRODUCTION_STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Titulo</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: Reels principal da campanha"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Resumo do brief</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="textarea-field"
                  placeholder="Qual o objetivo comercial desta entrega?"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Campaign</span>
                  <input
                    value={form.campaign}
                    onChange={(event) => setForm((current) => ({ ...current, campaign: event.target.value }))}
                    className="input-field"
                    placeholder="Ex: Lancamento Q2"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Placement</span>
                  <input
                    value={form.placement}
                    onChange={(event) => setForm((current) => ({ ...current, placement: event.target.value }))}
                    className="input-field"
                    placeholder="Ex: Meta Ads / Reels"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Prazo</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                    className="input-field"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Reviewer</span>
                  <input
                    value={form.reviewer}
                    onChange={(event) => setForm((current) => ({ ...current, reviewer: event.target.value }))}
                    className="input-field"
                    placeholder="Ex: head de criacao"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Estrutura / observacoes</span>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field"
                  placeholder="Detalhe hook, CTA, asset necessario e criterio de aprovacao."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Asset final</span>
                <input
                  type="file"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      assetFile: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="input-field file:mr-4 file:rounded-xl file:border-0 file:bg-action-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.18em] file:text-action-primary"
                />
                {form.assetFileId ? (
                  <span className="text-xs text-text-muted">Arquivo atual vinculado a esta entrega.</span>
                ) : null}
              </label>

              <div className="grid gap-4">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Strategy driver</span>
                  <select
                    value={form.strategyItemId}
                    onChange={(event) => setForm((current) => ({ ...current, strategyItemId: event.target.value }))}
                    className="select-field"
                  >
                    <option value="">Sem vinculo estrategico</option>
                    {strategyItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Copy source</span>
                  <select
                    value={form.copyItemId}
                    onChange={(event) => setForm((current) => ({ ...current, copyItemId: event.target.value }))}
                    className="select-field"
                  >
                    <option value="">Sem copy vinculada</option>
                    {copyItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              {form.id ? (
                <MotionButton
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-[0.22em]"
                >
                  Remover
                </MotionButton>
              ) : null}
              <MotionButton
                variant="secondary"
                onClick={() => {
                  setSelectedItemId(null)
                  setForm(createInitialState())
                }}
                disabled={saving}
                className="px-4 py-3 text-xs font-bold uppercase tracking-[0.22em]"
              >
                Limpar
              </MotionButton>
              <MotionButton
                onClick={() => void handleSave()}
                disabled={saving}
                className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
              >
                {saving ? 'Salvando...' : form.id ? 'Atualizar entrega' : 'Criar entrega'}
              </MotionButton>
            </div>
          </aside>
        </section>
      </div>
    </ProjectLayout>
  )
}

export default ProductionWorkspace
