import { useEffect, useMemo, useState } from 'react'

import { MotionButton } from '@/components/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@/components/molecules'
import { getProjectLibraryRelationLabel, type SerializedProjectLibraryItem } from '@/lib/projectDomain'

import { useProjectDomainLibrary } from './useProjectDomainLibrary'

interface StrategyWorkspaceProps {
  projectId: string
}

const STRATEGY_CATEGORIES = [
  { key: 'PRODUTOS', label: 'Produtos' },
  { key: 'OFERTAS', label: 'Ofertas' },
  { key: 'PUBLICOS', label: 'Publicos' },
  { key: 'FUNIS', label: 'Funis' },
  { key: 'CAMPANHAS', label: 'Campanhas' },
] as const

const PRIORITY_OPTIONS = ['Baixa', 'Media', 'Alta', 'Critica'] as const
const STAGE_OPTIONS = ['Hipotese', 'Validando', 'Aprovado', 'Ativo'] as const

interface StrategyFormState {
  id?: string
  category: string
  title: string
  description: string
  content: string
  objective: string
  hypothesis: string
  priority: string
  stage: string
  owner: string
  relatedItemIds: string[]
}

function createInitialState(category: string): StrategyFormState {
  return {
    category,
    title: '',
    description: '',
    content: '',
    objective: '',
    hypothesis: '',
    priority: 'Media',
    stage: 'Hipotese',
    owner: '',
    relatedItemIds: [],
  }
}

function mapItemToForm(item: SerializedProjectLibraryItem): StrategyFormState {
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    objective: String(item.payload.objective ?? ''),
    hypothesis: String(item.payload.hypothesis ?? ''),
    priority: String(item.payload.priority ?? 'Media'),
    stage: String(item.payload.stage ?? 'Hipotese'),
    owner: String(item.payload.owner ?? ''),
    relatedItemIds: item.relatedItems
      .filter((relation) => relation.relationType === 'DEPENDS_ON')
      .map((relation) => relation.targetItemId),
  }
}

export function StrategyWorkspace({ projectId }: StrategyWorkspaceProps) {
  const { items, allItems, loading, saving, error, saveItem, deleteItem } = useProjectDomainLibrary(projectId, 'STRATEGY')
  const [selectedCategory, setSelectedCategory] = useState<string>(STRATEGY_CATEGORIES[0].key)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<StrategyFormState>(() => createInitialState(STRATEGY_CATEGORIES[0].key))

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (item.content ?? '').toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [items, search, selectedCategory])

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const dependencyOptions = useMemo(
    () =>
      allItems.filter(
        (item) =>
          item.domain === 'STRATEGY' &&
          item.id !== form.id &&
          item.category !== form.category,
      ),
    [allItems, form.category, form.id],
  )

  useEffect(() => {
    if (!selectedItemId) {
      setForm(createInitialState(selectedCategory))
      return
    }

    if (selectedItem) {
      setSelectedCategory(selectedItem.category)
      setForm(mapItemToForm(selectedItem))
    }
  }, [selectedCategory, selectedItem, selectedItemId])

  const handleNewItem = () => {
    setSelectedItemId(null)
    setMessage(null)
    setForm(createInitialState(selectedCategory))
  }

  const handleToggleDependency = (itemId: string) => {
    setForm((current) => ({
      ...current,
      relatedItemIds: current.relatedItemIds.includes(itemId)
        ? current.relatedItemIds.filter((entry) => entry !== itemId)
        : [...current.relatedItemIds, itemId],
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Defina um titulo para registrar esta decisao estrategica.' })
      return
    }

    try {
      await saveItem({
        id: form.id,
        category: form.category,
        title: form.title,
        description: form.description,
        content: form.content,
        status: form.stage === 'Ativo' ? 'Approved' : 'In Review',
        payload: {
          objective: form.objective,
          hypothesis: form.hypothesis,
          priority: form.priority,
          stage: form.stage,
          owner: form.owner,
        },
        relationTargets: form.relatedItemIds.map((targetItemId) => ({
          targetItemId,
          relationType: 'DEPENDS_ON',
        })),
      })
      setMessage({ type: 'success', text: form.id ? 'Bloco estrategico atualizado.' : 'Bloco estrategico criado.' })
      setSelectedItemId(null)
      setForm(createInitialState(selectedCategory))
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar este bloco estrategico.',
      })
    }
  }

  const handleDelete = async () => {
    if (!form.id) {
      return
    }

    try {
      await deleteItem(form.id)
      setMessage({ type: 'success', text: 'Bloco estrategico removido.' })
      setSelectedItemId(null)
      setForm(createInitialState(selectedCategory))
    } catch (deleteError) {
      setMessage({
        type: 'error',
        text: deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover este item.',
      })
    }
  }

  return (
    <ProjectLayout projectId={projectId}>
      <div className="space-y-8 px-6">
        <ProjectWorkspaceHero
          eyebrow="Mapa de decisao"
          title="STRATEGY LIBRARY"
          description="Saia do CRUD generico e transforme produtos, ofertas, publicos, funis e campanhas em um mapa relacional que governa copy, producao e prioridade executiva."
          actions={(
            <MotionButton onClick={handleNewItem} className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]">
              Novo bloco estrategico
            </MotionButton>
          )}
          metrics={(
            <>
              <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                {items.length} decisoes ativas
              </span>
              <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                Workspace relacional
              </span>
            </>
          )}
        />

        {error ? <StatusNotice tone="error" title="Strategy indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Strategy atualizada' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <div className="panel-shell p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap gap-3">
                  {STRATEGY_CATEGORIES.map((category) => (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.key)
                        setSelectedItemId(null)
                      }}
                      className={`summary-pill ${selectedCategory === category.key ? 'border-action-primary/20 bg-action-primary/10 text-action-primary' : 'border-border/60 bg-surface-muted/30 text-text-muted'}`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <label className="flex min-w-[280px] flex-col gap-2">
                  <span className="field-label mb-0">Buscar no mapa estrategico</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Posicionamento, campanha, publico..."
                    className="input-field"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <div className="panel-shell p-6 text-text-muted">Carregando blocos estrategicos...</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state min-h-[260px] gap-3 px-6 py-10 md:col-span-2">
                  <div className="empty-state-icon">ST</div>
                  <p className="text-xl font-display font-bold text-text">Sem decisao registrada nesta camada</p>
                  <p className="max-w-xl text-center text-text-muted">
                    Comece definindo um item em {STRATEGY_CATEGORIES.find((category) => category.key === selectedCategory)?.label?.toLowerCase()} para alimentar copy, producao e leitura executiva.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={`panel-shell p-5 text-left transition-all hover:-translate-y-0.5 hover:border-action-primary/20 ${selectedItemId === item.id ? 'border-action-primary/30 ring-2 ring-action-primary/15' : ''}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                        {item.category}
                      </span>
                      <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                        {String(item.payload.priority ?? 'Media')}
                      </span>
                      <span className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                        {String(item.payload.stage ?? 'Hipotese')}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-display font-bold text-text">{item.title}</h3>
                    <p className="mt-3 text-sm text-text-muted">
                      {item.description || String(item.payload.objective || 'Sem objetivo definido ainda.')}
                    </p>

                    {item.relatedItems.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.relatedItems.slice(0, 3).map((relation) => (
                          <span key={relation.id} className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                            {getProjectLibraryRelationLabel(relation.relationType)}: {relation.targetTitle}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>

          <aside className="panel-shell sticky top-8 h-fit p-6">
            <div>
              <p className="eyebrow-label text-action-primary/70">Strategy editor</p>
              <h2 className="mt-3 text-xl font-display font-bold text-text">
                {form.id ? 'Refinar bloco selecionado' : 'Criar novo bloco'}
              </h2>
              <p className="mt-3 text-sm text-text-muted">
                Registre hipoteses, donos, prioridade e dependencias para transformar estrategia em sistema vivo.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Categoria</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="select-field"
                >
                  {STRATEGY_CATEGORIES.map((category) => (
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
                  placeholder="Ex: Oferta principal de entrada"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Objetivo</span>
                <input
                  value={form.objective}
                  onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: converter leads frios em diagnostico"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Hipotese</span>
                <textarea
                  value={form.hypothesis}
                  onChange={(event) => setForm((current) => ({ ...current, hypothesis: event.target.value }))}
                  className="textarea-field"
                  placeholder="Qual tese orienta esta decisao?"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Prioridade</span>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                    className="select-field"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Estagio</span>
                  <select
                    value={form.stage}
                    onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value }))}
                    className="select-field"
                  >
                    {STAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Owner</span>
                <input
                  value={form.owner}
                  onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: estrategista, squad comercial"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Resumo executivo</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="textarea-field"
                  placeholder="Sintese curta para leitura no dashboard e nos cards."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Contexto detalhado</span>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field"
                  placeholder="Documente dados, decisao, observacoes e implicacoes."
                />
              </label>

              <div className="space-y-3 rounded-3xl border border-border/60 bg-surface-muted/20 p-4">
                <div>
                  <p className="field-label mb-0">Dependencias estrategicas</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Conecte este bloco a outras decisoes para formar o mapa de estrategia do projeto.
                  </p>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {dependencyOptions.length === 0 ? (
                    <p className="text-sm text-text-muted">Ainda nao existem outros blocos para relacionar.</p>
                  ) : (
                    dependencyOptions.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-surface/40 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={form.relatedItemIds.includes(item.id)}
                          onChange={() => handleToggleDependency(item.id)}
                          className="mt-1"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-text">{item.title}</span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-text-muted">
                            {item.category}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
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
                onClick={handleNewItem}
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
                {saving ? 'Salvando...' : form.id ? 'Atualizar bloco' : 'Criar bloco'}
              </MotionButton>
            </div>
          </aside>
        </section>
      </div>
    </ProjectLayout>
  )
}

export default StrategyWorkspace
