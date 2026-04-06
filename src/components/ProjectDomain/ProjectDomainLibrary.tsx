import { useEffect, useMemo, useState } from 'react'

import { MotionButton } from '@brand-ops/ui/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@brand-ops/ui/molecules'
import {
  getDomainUploadScope,
  type ProjectLibraryDomain,
  type SerializedProjectLibraryItem,
} from '@/lib/projectDomain'

interface CategoryOption {
  key: string
  label: string
  description?: string
}

interface ExtraFieldConfig {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'textarea'
}

interface ProjectDomainLibraryProps {
  projectId: string
  projectName?: string
  domain: ProjectLibraryDomain
  eyebrow: string
  title: string
  description: string
  categories: CategoryOption[]
  supportsAssetUpload?: boolean
  supportsLink?: boolean
  statusOptions?: string[]
  contentLabel?: string
  extraFields?: ExtraFieldConfig[]
  primaryToggleLabel?: string
  embedded?: boolean
}

interface LibraryFormState {
  id?: string
  category: string
  title: string
  description: string
  content: string
  status: string
  linkUrl: string
  isPrimary: boolean
  assetFile: File | null
  assetFileId?: string | null
  payload: Record<string, string>
}

function toInitialState(category: string, extraFields: ExtraFieldConfig[] = []): LibraryFormState {
  return {
    category,
    title: '',
    description: '',
    content: '',
    status: 'Draft',
    linkUrl: '',
    isPrimary: false,
    assetFile: null,
    assetFileId: null,
    payload: Object.fromEntries(extraFields.map((field) => [field.key, ''])),
  }
}

export function ProjectDomainLibrary({
  projectId,
  projectName,
  domain,
  eyebrow,
  title,
  description,
  categories,
  supportsAssetUpload = false,
  supportsLink = false,
  statusOptions = ['Draft', 'In Review', 'Approved'],
  contentLabel = 'Conteudo',
  extraFields = [],
  primaryToggleLabel,
  embedded = false,
}: ProjectDomainLibraryProps) {
  const [items, setItems] = useState<SerializedProjectLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.key ?? '')
  const [form, setForm] = useState<LibraryFormState>(() => toInitialState(categories[0]?.key ?? '', extraFields))

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [items, search, selectedCategory])

  const loadItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams({ domain })
      const response = await fetch(`/api/projeto/${projectId}/library?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Nao foi possivel carregar a biblioteca deste dominio.')
      }

      const result = (await response.json()) as { items: SerializedProjectLibraryItem[] }
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar a biblioteca deste dominio.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
  }, [projectId, domain])

  useEffect(() => {
    setForm((current) =>
      current.id
        ? current
        : {
            ...current,
            category: selectedCategory,
          },
    )
  }, [selectedCategory])

  const resetForm = () => {
    setForm(toInitialState(selectedCategory, extraFields))
  }

  const handleEdit = (item: SerializedProjectLibraryItem) => {
    setForm({
      id: item.id,
      category: item.category,
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      status: item.status,
      linkUrl: item.linkUrl || '',
      isPrimary: item.isPrimary,
      assetFile: null,
      assetFileId: item.assetFileId || null,
      payload: Object.fromEntries(
        extraFields.map((field) => [field.key, String(item.payload[field.key] ?? '')]),
      ),
    })
    setSelectedCategory(item.category)
    setMessage(null)
  }

  const handleDelete = async (itemId: string) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/projeto/${projectId}/library/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Nao foi possivel remover o item.')
      }

      await loadItems()
      if (form.id === itemId) {
        resetForm()
      }
      setMessage({ type: 'success', text: 'Item removido com sucesso.' })
    } catch (deleteError) {
      setMessage({
        type: 'error',
        text: deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover o item.',
      })
    } finally {
      setSaving(false)
    }
  }

  const uploadAssetIfNeeded = async (): Promise<string | null | undefined> => {
    if (!form.assetFile) {
      return form.assetFileId
    }

    const formData = new FormData()
    formData.append('file', form.assetFile)
    formData.append('projectId', projectId)
    formData.append('scope', getDomainUploadScope(domain))

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const uploadError = await response.json().catch(() => ({ error: 'Falha no upload do arquivo.' }))
      throw new Error(uploadError.error || 'Falha no upload do arquivo.')
    }

    const result = (await response.json()) as { file: { id: string } }
    return result.file.id
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Preencha o titulo antes de salvar.' })
      return
    }

    if (!form.category) {
      setMessage({ type: 'error', text: 'Selecione a categoria deste item.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const assetFileId = await uploadAssetIfNeeded()
      const kind =
        assetFileId ? 'FILE' : supportsLink && form.linkUrl.trim() ? 'LINK' : domain === 'BRAND_CORE' && form.category === 'PALETA_DE_CORES' ? 'PALETTE' : 'NOTE'

      const payload = Object.fromEntries(
        Object.entries(form.payload).filter(([, value]) => value.trim().length > 0),
      )

      const body = {
        domain,
        category: form.category,
        title: form.title,
        description: form.description,
        content: form.content,
        status: form.status,
        linkUrl: form.linkUrl,
        kind,
        isPrimary: form.isPrimary,
        assetFileId,
        payload,
      }

      const response = await fetch(
        form.id ? `/api/projeto/${projectId}/library/${form.id}` : `/api/projeto/${projectId}/library`,
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )

      if (!response.ok) {
        const responseError = await response.json().catch(() => ({ error: 'Nao foi possivel salvar o item.' }))
        throw new Error(responseError.error || 'Nao foi possivel salvar o item.')
      }

      await loadItems()
      resetForm()
      setMessage({
        type: 'success',
        text: form.id ? 'Item atualizado com sucesso.' : 'Item criado com sucesso.',
      })
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Nao foi possivel salvar o item.',
      })
    } finally {
      setSaving(false)
    }
  }

  const content = (
      <div className="space-y-8 px-6">
        <ProjectWorkspaceHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          metrics={
            <>
              <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                {items.length} item(ns)
              </span>
              <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                {categories.length} categoria(s)
              </span>
            </>
          }
        />

        {error ? <StatusNotice tone="error" title="Biblioteca indisponivel" message={error} role="alert" /> : null}
        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Operacao concluida' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <section className="panel-shell p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`summary-pill ${selectedCategory === category.key ? 'border-action-primary/20 bg-action-primary/10 text-action-primary' : 'border-border/60 bg-surface-muted/40 text-text-muted'}`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <label className="flex min-w-[280px] flex-col gap-2">
              <span className="field-label mb-0">Busca</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-field"
                placeholder="Buscar por titulo, resumo ou conteudo"
              />
            </label>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,1.35fr]">
          <div className="panel-shell p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow-label text-action-primary/70">Editor</p>
                <h2 className="mt-3 text-2xl font-display font-bold text-text">
                  {form.id ? 'Atualizar item' : 'Novo item'}
                </h2>
              </div>
              {form.id ? (
                <MotionButton variant="ghost" onClick={resetForm} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">
                  Cancelar edicao
                </MotionButton>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Categoria</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="select-field"
                >
                  {categories.map((category) => (
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
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Resumo</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="textarea-field min-h-[120px]"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">{contentLabel}</span>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="textarea-field min-h-[180px]"
                />
              </label>

              {extraFields.map((field) => (
                <label key={field.key} className="flex flex-col gap-2">
                  <span className="field-label mb-0">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form.payload[field.key] ?? ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          payload: { ...current.payload, [field.key]: event.target.value },
                        }))
                      }
                      className="textarea-field min-h-[120px]"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      value={form.payload[field.key] ?? ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          payload: { ...current.payload, [field.key]: event.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder={field.placeholder}
                    />
                  )}
                </label>
              ))}

              <label className="flex flex-col gap-2">
                <span className="field-label mb-0">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="select-field"
                >
                  {statusOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </label>

              {supportsLink ? (
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Link</span>
                  <input
                    value={form.linkUrl}
                    onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))}
                    className="input-field"
                    placeholder="https://..."
                  />
                </label>
              ) : null}

              {supportsAssetUpload ? (
                <label className="flex flex-col gap-2">
                  <span className="field-label mb-0">Asset</span>
                  <input
                    type="file"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assetFile: event.target.files?.[0] || null,
                      }))
                    }
                    className="block w-full text-sm text-text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-action-primary file:px-4 file:py-2 file:text-white hover:file:bg-action-primary-hover"
                  />
                  {form.assetFileId && !form.assetFile ? (
                    <span className="field-helper">Arquivo atual vinculado a este item.</span>
                  ) : null}
                </label>
              ) : null}

              {primaryToggleLabel ? (
                <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-muted/30 px-4 py-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(event) => setForm((current) => ({ ...current, isPrimary: event.target.checked }))}
                  />
                  <span>{primaryToggleLabel}</span>
                </label>
              ) : null}

              <div className="flex justify-end">
                <MotionButton onClick={() => void handleSubmit()} disabled={saving} className="px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]">
                  {saving ? 'Salvando...' : form.id ? 'Atualizar item' : 'Criar item'}
                </MotionButton>
              </div>
            </div>
          </div>

          <div className="panel-shell p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow-label text-action-primary/70">Biblioteca</p>
                <h2 className="mt-3 text-2xl font-display font-bold text-text">Itens do dominio</h2>
              </div>
              <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                {filteredItems.length} em vista
              </span>
            </div>

            {loading ? (
              <div className="empty-state mt-6 min-h-[280px] gap-3 px-6 py-10">
                <div className="empty-state-icon animate-pulse">DL</div>
                <p className="text-lg font-display font-bold text-text">Carregando biblioteca</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state mt-6 min-h-[280px] gap-3 px-6 py-10">
                <div className="empty-state-icon">DL</div>
                <p className="text-lg font-display font-bold text-text">Nenhum item encontrado</p>
                <p className="max-w-sm text-center text-text-muted">
                  Crie o primeiro item desta categoria para estruturar o dominio dentro do projeto.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredItems.map((item) => (
                  <article key={item.id} className="rounded-[1.75rem] border border-border/60 bg-surface-muted/20 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                            {categories.find((category) => category.key === item.category)?.label ?? item.category}
                          </span>
                          <span className="summary-pill border-border/60 bg-surface text-text-muted">
                            {item.status}
                          </span>
                          {item.isPrimary ? (
                            <span className="summary-pill border-status-success/30 bg-status-success/10 text-status-success">
                              Principal
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-xl font-display font-bold text-text">{item.title}</h3>
                        {item.description ? <p className="text-sm leading-7 text-text-muted">{item.description}</p> : null}
                      </div>

                      <div className="flex gap-2">
                        <MotionButton variant="secondary" onClick={() => handleEdit(item)} className="px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                          Editar
                        </MotionButton>
                        <MotionButton variant="ghost" onClick={() => void handleDelete(item.id)} className="px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                          Remover
                        </MotionButton>
                      </div>
                    </div>

                    {item.assetPreviewUrl ? (
                      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border/60 bg-surface">
                        {item.assetMimeType?.startsWith('image/') ? (
                          <img src={item.assetPreviewUrl} alt={item.title} className="h-48 w-full object-cover" />
                        ) : (
                          <div className="flex min-h-[120px] items-center justify-center px-6 py-8 text-sm font-semibold text-text-muted">
                            {item.assetFilename || 'Arquivo vinculado'}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {item.content ? (
                      <div className="mt-4 rounded-2xl border border-border/60 bg-surface px-4 py-4">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-text">{item.content}</p>
                      </div>
                    ) : null}

                    {Object.keys(item.payload).length > 0 ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {Object.entries(item.payload).map(([key, value]) => (
                          <div key={key} className="rounded-2xl border border-border/60 bg-surface px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{key}</p>
                            <p className="mt-2 text-sm text-text">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {item.linkUrl ? (
                      <a href={item.linkUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-action-primary">
                        Abrir link vinculado
                      </a>
                    ) : null}

                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-muted">
                      Atualizado em {new Date(item.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
  )

  if (embedded) {
    return content
  }

  return (
    <ProjectLayout projectId={projectId} projectName={projectName}>
      {content}
    </ProjectLayout>
  )
}

export default ProjectDomainLibrary
