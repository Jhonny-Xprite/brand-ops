import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Palette, Type, Upload, Wand2 } from 'lucide-react'

import { MotionButton } from '@/components/atoms'
import {
  BRAND_TONES,
  CLIENT_BRAND_MODES,
  SURFACE_STYLES,
  VISUAL_DENSITIES,
  type BrandTone,
  type ClientBrandMode,
  type SurfaceStyle,
  type VisualDensity,
} from '@/lib/projectDomain'

export interface BrandingFormData {
  projectName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralBase: string
  titleFont: string
  bodyFont: string
  clientBrandMode: ClientBrandMode
  surfaceStyle: SurfaceStyle
  visualDensity: VisualDensity
  brandTone: BrandTone
  logoFile?: File
  iconFile?: File
  symbolFile?: File
  wordmarkFile?: File
  logoFileId?: string
  iconFileId?: string
  symbolFileId?: string
  wordmarkFileId?: string
  logoPreviewUrl?: string
  iconPreviewUrl?: string
  symbolPreviewUrl?: string
  wordmarkPreviewUrl?: string
}

export interface BrandingFormProps {
  initialData?: BrandingFormData
  onSubmit: SubmitHandler<BrandingFormData>
  isLoading?: boolean
  showProjectName?: boolean
}

const FONT_OPTIONS = [
  { value: 'Sora', label: 'Sora' },
  { value: 'Inter', label: 'Inter' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Playfair Display', label: 'Playfair Display' },
]

function filePreviewHandler(
  setPreview: Dispatch<SetStateAction<string | null>>,
  setFile: Dispatch<SetStateAction<File | undefined>>,
  fallback: string | null,
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setFile(undefined)
      setPreview(fallback)
      return
    }

    setFile(file)
    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      setPreview(loadEvent.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

export const BrandingForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  showProjectName = true,
}: BrandingFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BrandingFormData>({
    defaultValues: {
      projectName: '',
      primaryColor: '#A855F7',
      secondaryColor: '#F0B34F',
      accentColor: '#F97316',
      neutralBase: '#1A1427',
      titleFont: 'Sora',
      bodyFont: 'Inter',
      clientBrandMode: 'FULL_SHELL',
      surfaceStyle: 'AURORA',
      visualDensity: 'BALANCED',
      brandTone: 'LUXURY_STRATEGIC',
    },
  })

  useEffect(() => {
    if (!initialData) {
      return
    }

    reset(initialData)
  }, [initialData, reset])

  const primaryColor = watch('primaryColor')
  const secondaryColor = watch('secondaryColor')
  const accentColor = watch('accentColor')
  const neutralBase = watch('neutralBase')
  const titleFont = watch('titleFont')
  const bodyFont = watch('bodyFont')
  const brandTone = watch('brandTone')

  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoPreviewUrl ?? null)
  const [iconPreview, setIconPreview] = useState<string | null>(initialData?.iconPreviewUrl ?? null)
  const [symbolPreview, setSymbolPreview] = useState<string | null>(initialData?.symbolPreviewUrl ?? null)
  const [wordmarkPreview, setWordmarkPreview] = useState<string | null>(initialData?.wordmarkPreviewUrl ?? null)
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | undefined>(undefined)
  const [selectedIconFile, setSelectedIconFile] = useState<File | undefined>(undefined)
  const [selectedSymbolFile, setSelectedSymbolFile] = useState<File | undefined>(undefined)
  const [selectedWordmarkFile, setSelectedWordmarkFile] = useState<File | undefined>(undefined)

  useEffect(() => {
    setLogoPreview(initialData?.logoPreviewUrl ?? null)
    setIconPreview(initialData?.iconPreviewUrl ?? null)
    setSymbolPreview(initialData?.symbolPreviewUrl ?? null)
    setWordmarkPreview(initialData?.wordmarkPreviewUrl ?? null)
  }, [
    initialData?.iconPreviewUrl,
    initialData?.logoPreviewUrl,
    initialData?.symbolPreviewUrl,
    initialData?.wordmarkPreviewUrl,
  ])

  const validateHexColor = (hex: string): boolean => /^#[0-9A-F]{6}$/i.test(hex)

  const handleLogoChange = useCallback(
    filePreviewHandler(setLogoPreview, setSelectedLogoFile, initialData?.logoPreviewUrl ?? null),
    [initialData?.logoPreviewUrl],
  )

  const handleIconChange = useCallback(
    filePreviewHandler(setIconPreview, setSelectedIconFile, initialData?.iconPreviewUrl ?? null),
    [initialData?.iconPreviewUrl],
  )

  const handleSymbolChange = useCallback(
    filePreviewHandler(setSymbolPreview, setSelectedSymbolFile, initialData?.symbolPreviewUrl ?? null),
    [initialData?.symbolPreviewUrl],
  )

  const handleWordmarkChange = useCallback(
    filePreviewHandler(setWordmarkPreview, setSelectedWordmarkFile, initialData?.wordmarkPreviewUrl ?? null),
    [initialData?.wordmarkPreviewUrl],
  )

  const tonePreview = useMemo(() => {
    switch (brandTone) {
      case 'PREMIUM_EDITORIAL':
        return 'Atmosfera sofisticada, refinada e mais editorial.'
      case 'TECH_EXECUTIVE':
        return 'Vibe de software premium, precisa e orientada a performance.'
      case 'LUXURY_STRATEGIC':
      default:
        return 'Luxo estrategico high ticket com presenca forte e executiva.'
    }
  }, [brandTone])

  const submitWithFiles = handleSubmit((values) =>
    onSubmit({
      ...values,
      logoFile: selectedLogoFile,
      iconFile: selectedIconFile,
      symbolFile: selectedSymbolFile,
      wordmarkFile: selectedWordmarkFile,
      logoPreviewUrl: logoPreview ?? undefined,
      iconPreviewUrl: iconPreview ?? undefined,
      symbolPreviewUrl: symbolPreview ?? undefined,
      wordmarkPreviewUrl: wordmarkPreview ?? undefined,
      logoFileId: initialData?.logoFileId,
      iconFileId: initialData?.iconFileId,
      symbolFileId: initialData?.symbolFileId,
      wordmarkFileId: initialData?.wordmarkFileId,
    }),
  )

  return (
    <form onSubmit={submitWithFiles} className="space-y-8">
      {showProjectName ? (
        <section className="panel-shell p-6">
          <div className="flex items-center gap-3">
            <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
              BO
            </div>
            <div>
              <p className="eyebrow-label text-action-primary/70">Project identity</p>
              <h2 className="mt-2 text-xl font-display font-bold text-text">Nome do projeto</h2>
            </div>
          </div>

          <div className="mt-8">
            <label className="field-label">Nome do Projeto</label>
            <input
              type="text"
              placeholder="Ex: Campanha Primavera"
              {...register('projectName', {
                required: 'Nome do projeto e obrigatorio',
                minLength: { value: 3, message: 'Minimo de 3 caracteres' },
                maxLength: { value: 50, message: 'Maximo de 50 caracteres' },
              })}
              className={`input-field ${errors.projectName ? 'input-field-error' : ''}`}
            />
            {errors.projectName ? <p className="field-error">{errors.projectName.message}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="brand-hero-panel panel-shell p-6">
        <div className="flex items-center gap-3">
          <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
            <Palette size={16} />
          </div>
          <div>
            <p className="eyebrow-label text-action-primary/70">Brand engine</p>
            <h2 className="mt-2 text-xl font-display font-bold text-text">Paleta e modo de aplicacao</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {[
            ['primaryColor', 'Cor Primaria', primaryColor],
            ['secondaryColor', 'Cor Secundaria', secondaryColor],
            ['accentColor', 'Accent / Glow', accentColor],
            ['neutralBase', 'Base Neutra', neutralBase],
          ].map(([field, label, color]) => (
            <div key={field}>
              <label className="field-label">{label}</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="#000000"
                  {...register(field as keyof BrandingFormData, {
                    required: `${label} e obrigatoria`,
                    validate: (value) => validateHexColor(String(value)) || 'HEX invalido (ex: #7c3aed)',
                  })}
                  className={`input-field ${errors[field as keyof BrandingFormData] ? 'input-field-error' : ''}`}
                />
                <div
                  className="h-12 w-12 rounded-2xl border border-border/60 bg-surface-muted"
                  style={{ backgroundColor: validateHexColor(String(color)) ? String(color) : 'transparent' }}
                />
              </div>
              {errors[field as keyof BrandingFormData] ? (
                <p className="field-error">{String(errors[field as keyof BrandingFormData]?.message || '')}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Modo da Marca do Cliente</span>
            <select className="select-field" {...register('clientBrandMode')}>
              {CLIENT_BRAND_MODES.map((value) => (
                <option key={value} value={value}>
                  Shell Completa
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Surface Style</span>
            <select className="select-field" {...register('surfaceStyle')}>
              {SURFACE_STYLES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label mb-0">Visual Density</span>
            <select className="select-field" {...register('visualDensity')}>
              {VISUAL_DENSITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel-shell p-6">
        <div className="flex items-center gap-3">
          <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
            <Type size={16} />
          </div>
          <div>
            <p className="eyebrow-label text-action-primary/70">Typography</p>
            <h2 className="mt-2 text-xl font-display font-bold text-text">Hierarquia e tom visual</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div>
            <label className="field-label">Fonte de Titulo</label>
            <select {...register('titleFont')} className="select-field">
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="field-helper">Atual: {titleFont}</p>
          </div>

          <div>
            <label className="field-label">Fonte de Corpo</label>
            <select {...register('bodyFont')} className="select-field">
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="field-helper">Atual: {bodyFont}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="field-label">Brand Tone</label>
          <select {...register('brandTone')} className="select-field">
            {BRAND_TONES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <p className="field-helper">{tonePreview}</p>
        </div>
      </section>

      <section className="panel-shell p-6">
        <div className="flex items-center gap-3">
          <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
            <Upload size={16} />
          </div>
          <div>
            <p className="eyebrow-label text-action-primary/70">Brand assets</p>
            <h2 className="mt-2 text-xl font-display font-bold text-text">Logo, simbolo e wordmark</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {[
            { label: 'Logo Principal', onChange: handleLogoChange, preview: logoPreview, fieldName: 'logoFile' as const },
            { label: 'Icone / App Mark', onChange: handleIconChange, preview: iconPreview, fieldName: 'iconFile' as const },
            { label: 'Simbolo / Emblema', onChange: handleSymbolChange, preview: symbolPreview, fieldName: 'symbolFile' as const },
            { label: 'Wordmark', onChange: handleWordmarkChange, preview: wordmarkPreview, fieldName: 'wordmarkFile' as const },
          ].map(({ label, onChange, preview, fieldName }) => (
            <div key={label} className="panel-shell border-border/60 bg-surface-muted/30 p-5">
              <label className="field-label">{label}</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                {...register(fieldName)}
                onChange={onChange}
                className="block w-full text-sm text-text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-action-primary file:px-4 file:py-2 file:text-white hover:file:bg-action-primary-hover"
              />
              {preview ? (
                <div className="mt-4 rounded-2xl border border-border/60 bg-surface px-4 py-4">
                  <img src={String(preview)} alt={`${label} preview`} className="h-14 w-auto object-contain" />
                </div>
              ) : (
                <p className="field-helper mt-4">Envie um arquivo para registrar esta assinatura visual.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel-shell p-6">
        <div className="flex items-center gap-3">
          <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
            <Wand2 size={16} />
          </div>
          <div>
            <p className="eyebrow-label text-action-primary/70">Preview</p>
            <h2 className="mt-2 text-xl font-display font-bold text-text">Como a shell vai se comportar</h2>
          </div>
        </div>

        <div
          className="mt-8 rounded-[2rem] border border-border/60 p-6 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}26, transparent 52%), linear-gradient(135deg, ${secondaryColor}12, ${neutralBase})`,
          }}
        >
          <p className="eyebrow-label text-action-secondary/90">Client shell preview</p>
          <h3 className="mt-3 text-3xl font-bold text-text" style={{ fontFamily: titleFont }}>
            Luxo estrategico aplicado a operacao
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted" style={{ fontFamily: bodyFont }}>
            Sidebar, hero, paineis e CTAs assumem esta marca com o mesmo DNA visual em dark e light mode.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <MotionButton type="submit" disabled={isLoading} className="px-6 py-3 text-xs font-bold uppercase tracking-[0.24em]">
          {isLoading ? 'Salvando...' : 'Salvar Brand Core'}
        </MotionButton>
      </div>
    </form>
  )
}

export default BrandingForm
