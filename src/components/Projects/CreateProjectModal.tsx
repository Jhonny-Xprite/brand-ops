import React, { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: { id: string; name: string; logoUrl?: string; createdAt: string }) => void
}

interface FormState {
  projectName: string
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
  const [form, setForm] = useState<FormState>({
    projectName: '',
    logoFile: null,
    loading: false,
    error: null,
    preview: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, projectName: e.target.value, error: null }))
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, logoFile: null, preview: null }))
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setForm((prev) => ({
        ...prev,
        error: 'Tipo de arquivo inválido. Permitidos: PNG, JPG, SVG',
      }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setForm((prev) => ({
        ...prev,
        error: 'Arquivo muito grande. Máximo 5MB',
      }))
      return
    }

    // Create preview
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
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.projectName.trim()) {
      setForm((prev) => ({ ...prev, error: 'Nome do projeto é obrigatório' }))
      return
    }

    if (!form.logoFile) {
      setForm((prev) => ({ ...prev, error: 'Logo é obrigatória' }))
      return
    }

    setForm((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('projectName', form.projectName.trim())
      formData.append('logoFile', form.logoFile)

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar projeto')
      }

      // Success
      onSuccess(data)
      setForm({
        projectName: '',
        logoFile: null,
        loading: false,
        error: null,
        preview: null,
      })
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setForm((prev) => ({ ...prev, loading: false, error: message }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Projeto</h2>
          <button
            onClick={onClose}
            disabled={form.loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Project Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Projeto *
            </label>
            <input
              type="text"
              value={form.projectName}
              onChange={handleNameChange}
              placeholder="Ex: Campanha X"
              disabled={form.loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.projectName.length}/50
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo do Projeto *
            </label>

            {form.preview ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={form.preview} alt="Preview" className="object-contain w-full h-full" />
                </div>
                <button
                  type="button"
                  onClick={() => handleFileSelect(null)}
                  disabled={form.loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  Trocar arquivo
                </button>
                <div className="text-xs text-gray-500">
                  {form.logoFile?.name} ({(form.logoFile!.size / 1024).toFixed(1)}KB)
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-900">Solte o arquivo aqui</p>
                <p className="text-xs text-gray-500 mt-1">ou clique para selecionar</p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG ou SVG - Máx 5MB</p>
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

          {/* Error Message */}
          {form.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{form.error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={form.loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.loading || !form.projectName.trim() || !form.logoFile}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {form.loading ? 'Criando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
