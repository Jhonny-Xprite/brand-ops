import React, { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { MotionButton } from '@brand-ops/ui/atoms'
import { DialogShell } from '@/components/organisms'
import type { ProjectBusinessModel } from '@/lib/projectDomain'

interface CreateProjectResult {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  createdAt: string
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: React.Dispatch<string>
}

interface FormState {
  projectName: string
  niche: string
  businessModel: ProjectBusinessModel
  logoFile: File | null
  loading: boolean
  error: string | null
  preview: string | null
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createProject } = useProjects()
  const [form, setForm] = useState<FormState>({
    projectName: '',
    niche: '',
    businessModel: 'INFOPRODUTO',
    logoFile: null,
    loading: false,
    error: null,
    preview: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setForm({
      projectName: '',
      niche: '',
      businessModel: 'INFOPRODUTO',
      logoFile: null,
      loading: false,
      error: null,
      preview: null,
    })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, projectName: e.target.value, error: null }))
  }

  const handleNicheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, niche: e.target.value, error: null }))
  }

  const handleBusinessModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      businessModel: e.target.value as ProjectBusinessModel,
      error: null,
    }))
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, logoFile: null, preview: null }))
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setForm((prev) => ({
        ...prev,
        error: 'Tipo de arquivo invalido. Permitidos: PNG, JPG, SVG',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setForm((prev) => ({
        ...prev,
        error: 'Arquivo muito grande. Maximo 5MB',
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setForm((prev) => ({
        ...prev,
        logoFile: file,
        preview: e.target?.result as string,
        error: null,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const [firstFile] = Array.from(e.dataTransfer.files)
    if (firstFile) {
      handleFileSelect(firstFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.projectName.trim()) {
      setForm((prev) => ({ ...prev, error: 'Nome do projeto e obrigatorio' }))
      return
    }

    if (!form.niche.trim()) {
      setForm((prev) => ({ ...prev, error: 'Nicho e obrigatorio' }))
      return
    }

    setForm((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const createdProject = (await createProject(
        {
          projectName: form.projectName.trim(),
          niche: form.niche.trim(),
          businessModel: form.businessModel,
          logoFile: form.logoFile,
        }
      )) as CreateProjectResult

      resetForm()
      onSuccess(createdProject.id)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setForm((prev) => ({ ...prev, loading: false, error: message }))
    }
  }

  const handleClose = () => {
    if (form.loading) {
      return
    }

    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <DialogShell
      eyebrow="Project onboarding"
      title="Novo Projeto"
      titleId="create-project-modal-title"
      onClose={handleClose}
      closeLabel="Fechar"
      actions={(
        <>
          <MotionButton
            variant="ghost"
            type="button"
            onClick={handleClose}
            disabled={form.loading}
            className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]"
          >
            Cancelar
          </MotionButton>
          <MotionButton
            variant="primary"
            type="submit"
            form="create-project-form"
            disabled={form.loading || !form.projectName.trim() || !form.niche.trim()}
            className="px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]"
          >
            {form.loading ? 'Criando...' : 'Criar Projeto'}
          </MotionButton>
        </>
      )}
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6 px-8 py-6">
        <div>
          <label className="field-label">
            Nome do Projeto *
          </label>
          <input
            type="text"
            value={form.projectName}
            onChange={handleNameChange}
            placeholder="Ex: Campanha X"
            disabled={form.loading}
            className="input-field"
            maxLength={50}
          />
          <div className="field-helper">
            {form.projectName.length}/50
          </div>
        </div>

        <div>
          <label className="field-label">
            Nicho *
          </label>
          <input
            type="text"
            value={form.niche}
            onChange={handleNicheChange}
            placeholder="Ex: Educacao, Moda, Saude"
            disabled={form.loading}
            className="input-field"
            maxLength={60}
          />
          <div className="field-helper">
            {form.niche.length}/60
          </div>
        </div>

        <div>
          <label className="field-label">
            Modelo de Negocio *
          </label>
          <select
            value={form.businessModel}
            onChange={handleBusinessModelChange}
            disabled={form.loading}
            className="select-field"
          >
            <option value="INFOPRODUTO">Infoproduto</option>
            <option value="ECOMMERCE">E-commerce</option>
            <option value="NEGOCIO_LOCAL">Negocio Local</option>
          </select>
        </div>

        <div>
          <label className="field-label">
            Logo do Projeto
          </label>

          {form.preview ? (
            <div className="panel-shell flex flex-col items-center gap-4 p-5">
              <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-border/60 bg-surface-muted/60">
                <img src={form.preview} alt="Preview" className="object-contain w-full h-full" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text">{form.logoFile?.name}</p>
                <p className="field-helper">
                  {(((form.logoFile?.size ?? 0) / 1024).toFixed(1))}KB
                </p>
              </div>
              <MotionButton
                variant="secondary"
                type="button"
                onClick={() => handleFileSelect(null)}
                disabled={form.loading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
              >
                Trocar arquivo
              </MotionButton>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="empty-state cursor-pointer gap-3 border-border/50 px-6 py-10 transition hover:border-action-primary/30 hover:bg-surface-muted/40"
            >
              <div className="empty-state-icon border-action-primary/20 bg-action-primary/10 text-action-primary">
                <Upload size={18} />
              </div>
              <p className="text-sm font-semibold text-text">Solte o arquivo aqui</p>
              <p className="text-xs text-text-muted">ou clique para selecionar</p>
              <p className="text-xs text-text-muted">PNG, JPG ou SVG - Max 5MB (opcional)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            disabled={form.loading}
            className="hidden"
          />
        </div>

        {form.error ? (
          <div className="rounded-2xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {form.error}
          </div>
        ) : null}
      </form>
    </DialogShell>
  )
}

export default CreateProjectModal
