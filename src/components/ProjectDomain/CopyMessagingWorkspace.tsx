import { useEffect, useMemo, useState } from 'react'

import { MotionButton } from '@brand-ops/ui/atoms'
import CopyCard from '@/components/Copy/CopyCard'
import CopyFilters from '@/components/Copy/CopyFilters'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@brand-ops/ui/molecules'

import { useProjectDomainLibrary } from './useProjectDomainLibrary'

interface CopyMessagingWorkspaceProps {
  projectId: string
}

const COPY_CATEGORIES = [
  { key: 'COPYS_DE_ANUNCIOS', label: 'Copys de Anuncios' },
  { key: 'HEADLINES', label: 'Headlines' },
  { key: 'SCRIPTS_ROTEIROS', label: 'Scripts / Roteiros' },
  { key: 'NOTIFICACOES', label: 'Notificacoes' },
  { key: 'BIG_IDEAS', label: 'Big Ideas' },
] as const

interface CopyFormState {
  id?: string
  category: string
  title: string
  content: string
  description: string
  angle: string
  audience: string
  channel: string
  offer: string
  awarenessStage: string
  status: string
  strategyItemId: string
  productionItemId: string
}

function createInitialState(): CopyFormState {
  return {
    category: COPY_CATEGORIES[0].key,
    title: '',
    content: '',
    description: '',
    angle: '',
    audience: '',
    channel: '',
    offer: '',
    awarenessStage: '',
    status: 'Draft',
    strategyItemId: '',
    productionItemId: '',
  }
}

export function CopyMessagingWorkspace({ projectId }: CopyMessagingWorkspaceProps) {
  const { items, allItems, loading, saving, error, saveItem, deleteItem } = useProjectDomainLibrary(projectId, 'COPY_MESSAGING')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [angleFilter, setAngleFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CopyFormState>(createInitialState)

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const strategyItems = useMemo(
    () => allItems.filter((item) => item.domain === 'STRATEGY'),
    [allItems],
  )

  const productionItems = useMemo(
    () => allItems.filter((item) => item.domain === 'CREATIVE_PRODUCTION'),
    [allItems],
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const angle = String(item.payload.angle ?? '')
      const audience = String(item.payload.audience ?? '')
      const matchesAngle = !angleFilter || angle === angleFilter
      const matchesAudience = !audienceFilter || audience === audienceFilter
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.content ?? '').toLowerCase().includes(search.toLowerCase())

      return matchesAngle && matchesAudience && matchesSearch
    })
  }, [angleFilter, audienceFilter, items, search])

  useEffect(() => {
    if (!selectedItem) {
      setForm(createInitialState())
      return
    }

    setForm({
      id: selectedItem.id,
      category: selectedItem.category,
      title: selectedItem.title,
      content: selectedItem.content ?? '',
      description: selectedItem.description ?? '',
      angle: String(selectedItem.payload.angle ?? ''),
      audience: String(selectedItem.payload.audience ?? ''),
      channel: String(selectedItem.payload.channel ?? ''),
      offer: String(selectedItem.payload.offer ?? ''),
      awarenessStage: String(selectedItem.payload.awarenessStage ?? ''),
      status: selectedItem.status,
      strategyItemId: selectedItem.relatedItems.find((relation) => relation.relationType === 'DRIVES')?.targetItemId ?? '',
      productionItemId: selectedItem.relatedItems.find((relation) => relation.relationType === 'USES')?.targetItemId ?? '',
    })
  }, [selectedItem])

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Defina titulo e texto para salvar esta mensagem.' })
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
        payload: {
          angle: form.angle,
          audience: form.audience,
          channel: form.channel,
          offer: form.offer,
          awarenessStage: form.awarenessStage,
        },
        relationTargets: [
          ...(form.strategyItemId ? [{ targetItemId: form.strategyItemId, relationType: 'DRIVES' as const }] : []),
          ...(form.productionItemId ? [{ targetItemId: form.productionItemId, relationType: 'USES' as const }] : []),
        ],
      })
      setMessage({ type: 'success', text: form.id ? 'Copy atualizada.' : 'Copy criada.' })
      setSelectedItemId(null)
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar esta copy.',
      })
    }
  }

  const handleDelete = async () => {
    if (!form.id) {
      return
    }

    try {
      await deleteItem(form.id)
      setMessage({ type: 'success', text: 'Copy removida.' })
      setSelectedItemId(null)
    } catch (deleteError) {
      setMessage({
        type: 'error',
        text: deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover esta copy.',
      })
    }
  }

  return (
    <ProjectLayout projectId={projectId}>
      <div className="space-y-8 px-6">
        <ProjectWorkspaceHero
          eyebrow="Studio verbal"
          title="COPY & MESSAGING"
          description="Centralize mensagens, angulos, publicos e versoes aprovadas em uma superficie editorial conectada a estrategia e criativos."
          actions={(
            <MotionButton
              onClick={() => {
                setSelectedItemId(null)
                setForm(createInitialState())
              }}
              className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
            >
              Nova mensagem
            </MotionButton>
          )}
        />

        {error ? <StatusNotice tone="error" title="Copy indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Biblioteca editorial atualizada' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <div className="panel-shell p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <CopyFilters
                  angle={angleFilter}
                  audience={audienceFilter}
                  onAngleChange={setAngleFilter}
                  onAudienceChange={setAudienceFilter}
                />
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Busca editorial</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="input-field"
                    placeholder="Headline, CTA, promessa..."
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <div className="panel-shell p-6 text-text-muted">Carregando biblioteca editorial...</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state min-h-[260px] gap-3 px-6 py-10 md:col-span-2">
                  <div className="empty-state-icon">CP</div>
                  <p className="text-xl font-display font-bold text-text">Nenhuma mensagem encontrada</p>
                  <p className="max-w-xl text-center text-text-muted">
                    Comece registrando uma big idea, headline ou script para construir o sistema verbal desta marca.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedItemId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedItemId(item.id)
                      }
                    }}
                    className="cursor-pointer text-left focus:outline-none"
                  >
                    <CopyCard
                      title={item.title}
                      content={item.content ?? ''}
                      copyType={item.category}
                      angle={String(item.payload.angle ?? 'geral')}
                      audience={String(item.payload.audience ?? 'todos')}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="panel-shell sticky top-8 h-fit p-6">
            <div>
              <p className="eyebrow-label text-action-primary/70">Copy editor</p>
              <h2 className="mt-3 text-xl font-display font-bold text-text">
                {form.id ? 'Refinar variacao' : 'Criar variacao'}
              </h2>
            </div>

            <div className="mt-8 space-y-5">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Categoria</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="select-field"
                >
                  {COPY_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Titulo</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: Headline de abertura"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Angulo</span>
                  <input
                    value={form.angle}
                    onChange={(event) => setForm((current) => ({ ...current, angle: event.target.value }))}
                    className="input-field"
                    placeholder="Autoridade, prova, urgencia"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Publico</span>
                  <input
                    value={form.audience}
                    onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}
                    className="input-field"
                    placeholder="Leads frios, base ativa"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Canal</span>
                  <input
                    value={form.channel}
                    onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))}
                    className="input-field"
                    placeholder="Meta Ads, Landing Page"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Oferta</span>
                  <input
                    value={form.offer}
                    onChange={(event) => setForm((current) => ({ ...current, offer: event.target.value }))}
                    className="input-field"
                    placeholder="Ex: mentoria premium"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Estagio de consciencia</span>
                <input
                  value={form.awarenessStage}
                  onChange={(event) => setForm((current) => ({ ...current, awarenessStage: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: problema, solucao, decisao"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Resumo</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="textarea-field"
                  placeholder="Em que contexto esta copy entra e que papel cumpre?"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Texto</span>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field min-h-[220px]"
                  placeholder="Escreva a variacao aprovada aqui."
                />
              </label>

              <div className="grid gap-4">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Drive estrategico</span>
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
                  <span className="field-label mb-0">Uso em criativo</span>
                  <select
                    value={form.productionItemId}
                    onChange={(event) => setForm((current) => ({ ...current, productionItemId: event.target.value }))}
                    className="select-field"
                  >
                    <option value="">Sem criativo vinculado</option>
                    {productionItems.map((item) => (
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
                {saving ? 'Salvando...' : form.id ? 'Atualizar mensagem' : 'Criar mensagem'}
              </MotionButton>
            </div>
          </aside>
        </section>
      </div>
    </ProjectLayout>
  )
}

export default CopyMessagingWorkspace
