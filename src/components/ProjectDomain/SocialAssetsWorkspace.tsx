import { useEffect, useMemo, useState } from 'react'

import { MotionButton } from '@brand-ops/ui/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@brand-ops/ui/molecules'

import { useProjectDomainLibrary } from './useProjectDomainLibrary'

interface SocialAssetsWorkspaceProps {
  projectId: string
}

const SOCIAL_CATEGORIES = [
  { key: 'FOTOS_DE_PERFIL', label: 'Fotos de Perfil' },
  { key: 'CAPAS', label: 'Capas' },
  { key: 'DESTAQUES', label: 'Destaques' },
] as const

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'LinkedIn'] as const

interface SocialFormState {
  id?: string
  category: string
  title: string
  description: string
  content: string
  status: string
  platform: string
  format: string
  safeArea: string
  slot: string
  assetFile: File | null
  assetFileId?: string | null
}

function createInitialState(): SocialFormState {
  return {
    category: SOCIAL_CATEGORIES[0].key,
    title: '',
    description: '',
    content: '',
    status: 'Draft',
    platform: 'Instagram',
    format: '',
    safeArea: '',
    slot: '',
    assetFile: null,
    assetFileId: null,
  }
}

export function SocialAssetsWorkspace({ projectId }: SocialAssetsWorkspaceProps) {
  const { items, loading, saving, error, saveItem, deleteItem } = useProjectDomainLibrary(projectId, 'SOCIAL_ASSETS')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<SocialFormState>(createInitialState)

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const filteredItems = useMemo(
    () => items.filter((item) => !platformFilter || String(item.payload.platform ?? '') === platformFilter),
    [items, platformFilter],
  )

  useEffect(() => {
    if (!selectedItem) {
      setForm(createInitialState())
      return
    }

    setForm({
      id: selectedItem.id,
      category: selectedItem.category,
      title: selectedItem.title,
      description: selectedItem.description ?? '',
      content: selectedItem.content ?? '',
      status: selectedItem.status,
      platform: String(selectedItem.payload.platform ?? 'Instagram'),
      format: String(selectedItem.payload.format ?? ''),
      safeArea: String(selectedItem.payload.safeArea ?? ''),
      slot: String(selectedItem.payload.slot ?? ''),
      assetFile: null,
      assetFileId: selectedItem.assetFileId ?? null,
    })
  }, [selectedItem])

  const handleSave = async () => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Defina um nome para este ativo social.' })
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
          platform: form.platform,
          format: form.format,
          safeArea: form.safeArea,
          slot: form.slot,
        },
      })
      setMessage({ type: 'success', text: form.id ? 'Asset social atualizado.' : 'Asset social criado.' })
      setSelectedItemId(null)
      setForm(createInitialState())
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar este asset social.',
      })
    }
  }

  const handleDelete = async () => {
    if (!form.id) {
      return
    }

    try {
      await deleteItem(form.id)
      setMessage({ type: 'success', text: 'Asset social removido.' })
      setSelectedItemId(null)
    } catch (deleteError) {
      setMessage({
        type: 'error',
        text: deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover este asset.',
      })
    }
  }

  return (
    <ProjectLayout projectId={projectId}>
      <div className="space-y-8 px-6">
        <ProjectWorkspaceHero
          eyebrow="Presenca por canal"
          title="SOCIAL ASSETS"
          description="Organize capas, fotos de perfil e destaques com preview por plataforma, formato seguro e separacao clara em relacao a midia bruta."
          actions={(
            <div className="flex flex-wrap gap-3">
              <select
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value)}
                className="select-field min-w-[220px]"
              >
                <option value="">Todas as redes</option>
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <MotionButton
                onClick={() => {
                  setSelectedItemId(null)
                  setForm(createInitialState())
                }}
                className="px-5 py-3 text-xs font-bold uppercase tracking-[0.22em]"
              >
                Novo asset social
              </MotionButton>
            </div>
          )}
        />

        {error ? <StatusNotice tone="error" title="Social indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Social atualizada' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="panel-shell p-6 text-text-muted">Carregando kit social...</div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state min-h-[260px] gap-3 px-6 py-10 md:col-span-2 xl:col-span-3">
                <div className="empty-state-icon">SO</div>
                <p className="text-xl font-display font-bold text-text">Sem assets sociais nesta camada</p>
                <p className="max-w-xl text-center text-text-muted">
                  Use esta area para tudo que representa a fachada institucional da marca por plataforma.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`panel-shell overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-action-primary/20 ${selectedItemId === item.id ? 'border-action-primary/30 ring-2 ring-action-primary/15' : ''}`}
                >
                  <div className="aspect-[4/3] border-b border-border bg-surface-muted/20 p-5">
                    <div className="flex h-full items-center justify-center rounded-[28px] border border-border/60 bg-surface">
                      {item.assetPreviewUrl ? (
                        <img src={item.assetPreviewUrl} alt={item.title} className="h-full w-full rounded-[28px] object-cover" />
                      ) : (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-text">{String(item.payload.platform ?? 'Canal')}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-muted">
                            Preview institucional
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                        {String(item.payload.platform ?? 'Sem rede')}
                      </span>
                      <span className="summary-pill border-border/60 bg-surface-muted/30 text-text-muted">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-text">{item.title}</h3>
                    <p className="text-sm text-text-muted">
                      {item.description || String(item.payload.format ?? 'Formato institucional')}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <aside className="panel-shell sticky top-8 h-fit p-6">
            <div>
              <p className="eyebrow-label text-action-primary/70">Social editor</p>
              <h2 className="mt-3 text-xl font-display font-bold text-text">
                {form.id ? 'Atualizar kit social' : 'Criar kit social'}
              </h2>
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
                    {SOCIAL_CATEGORIES.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    className="select-field"
                  >
                    <option value="Draft">Rascunho</option>
                    <option value="In Review">Em Revisao</option>
                    <option value="Approved">Aprovado</option>
                    <option value="Done">Publicado</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Titulo</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="input-field"
                  placeholder="Ex: Avatar principal Instagram"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Plataforma</span>
                  <select
                    value={form.platform}
                    onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
                    className="select-field"
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Formato</span>
                  <input
                    value={form.format}
                    onChange={(event) => setForm((current) => ({ ...current, format: event.target.value }))}
                    className="input-field"
                    placeholder="1:1, 16:9, 9:16"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Safe area</span>
                  <input
                    value={form.safeArea}
                    onChange={(event) => setForm((current) => ({ ...current, safeArea: event.target.value }))}
                    className="input-field"
                    placeholder="Ex: 1080x1350 com margem 120px"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Slot</span>
                  <input
                    value={form.slot}
                    onChange={(event) => setForm((current) => ({ ...current, slot: event.target.value }))}
                    className="input-field"
                    placeholder="Avatar, capa, destaque"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Observacoes de uso</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="textarea-field"
                  placeholder="Descreva quando e como este asset deve ser usado."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Checklist institucional</span>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field"
                  placeholder="Ex: respeitar safe area, manter contraste, usar em contas verificadas."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Arquivo</span>
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
              </label>
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
                {saving ? 'Salvando...' : form.id ? 'Atualizar asset' : 'Criar asset'}
              </MotionButton>
            </div>
          </aside>
        </section>
      </div>
    </ProjectLayout>
  )
}

export default SocialAssetsWorkspace
