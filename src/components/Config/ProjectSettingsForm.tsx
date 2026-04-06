import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { MotionButton } from '@brand-ops/ui/atoms'
import {
  BUSINESS_MODELS,
  getBusinessModelLabel,
  type ProjectBusinessModel,
} from '@/lib/projectDomain'

export interface ProjectSettingsFormData {
  projectName: string
  niche: string
  businessModel: ProjectBusinessModel
  instagramUrl: string
  youtubeUrl: string
  facebookUrl: string
  tiktokUrl: string
}

interface ProjectSettingsFormProps {
  initialData?: ProjectSettingsFormData
  onSubmit: SubmitHandler<ProjectSettingsFormData>
  isLoading?: boolean
}

export function ProjectSettingsForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProjectSettingsFormProps) {
  const validateOptionalUrl = (value: string) => {
    if (!value.trim()) {
      return true
    }

    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' || 'Use uma URL valida com http:// ou https://'
    } catch {
      return 'Use uma URL valida com http:// ou https://'
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSettingsFormData>({
    defaultValues: {
      projectName: '',
      niche: '',
      businessModel: 'INFOPRODUTO',
      instagramUrl: '',
      youtubeUrl: '',
      facebookUrl: '',
      tiktokUrl: '',
    },
  })

  useEffect(() => {
    if (!initialData) {
      return
    }

    reset(initialData)
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="panel-shell p-6">
        <div>
          <p className="eyebrow-label text-action-primary/70">Project setup</p>
          <h2 className="mt-3 text-xl font-display font-bold text-text">Dados gerais</h2>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Nome do Projeto</span>
            <input
              className={`input-field ${errors.projectName ? 'input-field-error' : ''}`}
              {...register('projectName', {
                required: 'Nome do projeto e obrigatorio',
                minLength: { value: 3, message: 'Minimo de 3 caracteres' },
                maxLength: { value: 50, message: 'Maximo de 50 caracteres' },
              })}
            />
            {errors.projectName ? <span className="field-error">{errors.projectName.message}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Nicho</span>
            <input
              className={`input-field ${errors.niche ? 'input-field-error' : ''}`}
              {...register('niche', {
                required: 'Nicho e obrigatorio',
                minLength: { value: 2, message: 'Minimo de 2 caracteres' },
                maxLength: { value: 60, message: 'Maximo de 60 caracteres' },
              })}
            />
            {errors.niche ? <span className="field-error">{errors.niche.message}</span> : null}
          </label>
        </div>

        <div className="mt-6">
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Modelo de Negocio</span>
            <select className="select-field" {...register('businessModel')}>
              {BUSINESS_MODELS.map((businessModel) => (
                <option key={businessModel} value={businessModel}>
                  {getBusinessModelLabel(businessModel)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel-shell p-6">
        <div>
          <p className="eyebrow-label text-action-primary/70">Social profile</p>
          <h2 className="mt-3 text-xl font-display font-bold text-text">Links institucionais</h2>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Instagram</span>
            <input
              className={`input-field ${errors.instagramUrl ? 'input-field-error' : ''}`}
              placeholder="https://instagram.com/..."
              {...register('instagramUrl', { validate: validateOptionalUrl })}
            />
            {errors.instagramUrl ? <span className="field-error">{errors.instagramUrl.message}</span> : null}
          </label>
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">YouTube</span>
            <input
              className={`input-field ${errors.youtubeUrl ? 'input-field-error' : ''}`}
              placeholder="https://youtube.com/..."
              {...register('youtubeUrl', { validate: validateOptionalUrl })}
            />
            {errors.youtubeUrl ? <span className="field-error">{errors.youtubeUrl.message}</span> : null}
          </label>
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Facebook</span>
            <input
              className={`input-field ${errors.facebookUrl ? 'input-field-error' : ''}`}
              placeholder="https://facebook.com/..."
              {...register('facebookUrl', { validate: validateOptionalUrl })}
            />
            {errors.facebookUrl ? <span className="field-error">{errors.facebookUrl.message}</span> : null}
          </label>
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">TikTok</span>
            <input
              className={`input-field ${errors.tiktokUrl ? 'input-field-error' : ''}`}
              placeholder="https://tiktok.com/@..."
              {...register('tiktokUrl', { validate: validateOptionalUrl })}
            />
            {errors.tiktokUrl ? <span className="field-error">{errors.tiktokUrl.message}</span> : null}
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <MotionButton type="submit" disabled={isLoading} className="px-6 py-3 text-xs font-bold uppercase tracking-[0.24em]">
          {isLoading ? 'Salvando...' : 'Salvar Configuracoes'}
        </MotionButton>
      </div>
    </form>
  )
}

export default ProjectSettingsForm
