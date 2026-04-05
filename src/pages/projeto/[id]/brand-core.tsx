import { GetServerSideProps } from 'next'
import { useEffect, useRef, useState } from 'react'

import BrandingForm, { type BrandingFormData } from '@/components/Config/BrandingForm'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { FadeIn } from '@/components/atoms'
import { StatusNotice } from '@/components/molecules'
import ProjectDomainLibrary from '@/components/ProjectDomain/ProjectDomainLibrary'
import { getBusinessModelLabel } from '@/lib/projectDomain'
import { useAppDispatch, useAppSelector } from '@/store'
import { upsertProject } from '@/store/projects/projects.slice'

interface BrandCorePageProps {
  projectId: string
}

interface BrandCoreResponse {
  projectId: string
  projectName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralBase: string
  titleFont: string
  bodyFont: string
  clientBrandMode: 'FULL_SHELL'
  surfaceStyle: 'AURORA' | 'GLASS' | 'SOLID'
  visualDensity: 'COMPACT' | 'BALANCED' | 'EDITORIAL'
  brandTone: 'LUXURY_STRATEGIC' | 'PREMIUM_EDITORIAL' | 'TECH_EXECUTIVE'
  logoFileId?: string
  iconFileId?: string
  symbolFileId?: string
  wordmarkFileId?: string
  logoPreviewUrl?: string
  iconPreviewUrl?: string
  symbolPreviewUrl?: string
  wordmarkPreviewUrl?: string
  createdAt: string
  updatedAt: string
}

export default function BrandCorePage({ projectId }: BrandCorePageProps) {
  const dispatch = useAppDispatch()
  const existingProject = useAppSelector((state) => state.projects.items.find((project) => project.id === projectId))
  const existingProjectRef = useRef(existingProject)
  const [config, setConfig] = useState<BrandingFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    existingProjectRef.current = existingProject
  }, [existingProject])

  useEffect(() => {
    const fetchBrandCore = async () => {
      setLoading(true)
      setMessage(null)

      try {
        const response = await fetch(`/api/projeto/${projectId}/brand-core`)
        if (!response.ok) {
          throw new Error('Nao foi possivel carregar o brand core do projeto.')
        }

        const data = (await response.json()) as BrandCoreResponse
        const projectSnapshot = existingProjectRef.current
        setConfig({
          projectName: data.projectName,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          neutralBase: data.neutralBase,
          titleFont: data.titleFont,
          bodyFont: data.bodyFont,
          clientBrandMode: data.clientBrandMode,
          surfaceStyle: data.surfaceStyle,
          visualDensity: data.visualDensity,
          brandTone: data.brandTone,
          logoFileId: data.logoFileId,
          iconFileId: data.iconFileId,
          symbolFileId: data.symbolFileId,
          wordmarkFileId: data.wordmarkFileId,
          logoPreviewUrl: data.logoPreviewUrl,
          iconPreviewUrl: data.iconPreviewUrl,
          symbolPreviewUrl: data.symbolPreviewUrl,
          wordmarkPreviewUrl: data.wordmarkPreviewUrl,
        })
        dispatch(
          upsertProject({
            id: projectId,
            name: data.projectName,
            niche: projectSnapshot?.niche ?? '',
            businessModel: projectSnapshot?.businessModel ?? 'INFOPRODUTO',
            logoUrl: data.logoPreviewUrl,
            assetCount: 0,
            createdAt: data.createdAt,
            socialLinks: projectSnapshot?.socialLinks,
          }),
        )
      } catch (error) {
        console.error('Failed to fetch brand core:', error)
        setMessage({ type: 'error', text: 'Erro ao carregar os ativos de identidade.' })
      } finally {
        setLoading(false)
      }
    }

    void fetchBrandCore()
  }, [dispatch, projectId])

  const uploadBrandAsset = async (
    file: File | undefined,
    kind: 'logo' | 'icon' | 'symbol' | 'wordmark',
  ): Promise<string | undefined> => {
    if (!file) {
      return config?.[
        kind === 'logo'
          ? 'logoFileId'
          : kind === 'icon'
            ? 'iconFileId'
            : kind === 'symbol'
              ? 'symbolFileId'
              : 'wordmarkFileId'
      ]
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('scope', 'brand-core')

    const uploadResponse = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      throw new Error('Nao foi possivel enviar o ativo de marca.')
    }

    const uploadData = await uploadResponse.json()
    const fileId = uploadData.file.id as string

    await fetch(`/api/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'image',
        status: 'Approved',
        tags: [`project-${projectId}`, 'scope:brand-core', `brand:${kind}`],
        notes: `Ativo de marca (${kind}) vinculado ao projeto ${projectId}.`,
      }),
    })

    return fileId
  }

  const handleSubmit = async (data: BrandingFormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const [logoFileId, iconFileId, symbolFileId, wordmarkFileId] = await Promise.all([
        uploadBrandAsset(data.logoFile, 'logo'),
        uploadBrandAsset(data.iconFile, 'icon'),
        uploadBrandAsset(data.symbolFile, 'symbol'),
        uploadBrandAsset(data.wordmarkFile, 'wordmark'),
      ])

      const response = await fetch(`/api/projeto/${projectId}/brand-core`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          neutralBase: data.neutralBase,
          titleFont: data.titleFont,
          bodyFont: data.bodyFont,
          clientBrandMode: data.clientBrandMode,
          surfaceStyle: data.surfaceStyle,
          visualDensity: data.visualDensity,
          brandTone: data.brandTone,
          logoFileId,
          iconFileId,
          symbolFileId,
          wordmarkFileId,
        }),
      })

      if (!response.ok) {
        throw new Error('Nao foi possivel salvar o brand core do projeto.')
      }

      const result = (await response.json()) as BrandCoreResponse
      setConfig({
        projectName: result.projectName,
        primaryColor: result.primaryColor,
        secondaryColor: result.secondaryColor,
        accentColor: result.accentColor,
        neutralBase: result.neutralBase,
        titleFont: result.titleFont,
        bodyFont: result.bodyFont,
        clientBrandMode: result.clientBrandMode,
        surfaceStyle: result.surfaceStyle,
        visualDensity: result.visualDensity,
        brandTone: result.brandTone,
        logoFileId: result.logoFileId,
        iconFileId: result.iconFileId,
        symbolFileId: result.symbolFileId,
        wordmarkFileId: result.wordmarkFileId,
        logoPreviewUrl: result.logoPreviewUrl,
        iconPreviewUrl: result.iconPreviewUrl,
        symbolPreviewUrl: result.symbolPreviewUrl,
        wordmarkPreviewUrl: result.wordmarkPreviewUrl,
      })
      dispatch(
        upsertProject({
          id: projectId,
          name: result.projectName,
          niche: existingProject?.niche ?? '',
          businessModel: existingProject?.businessModel ?? 'INFOPRODUTO',
          logoUrl: result.logoPreviewUrl,
          assetCount: 0,
          createdAt: result.createdAt,
          socialLinks: existingProject?.socialLinks,
        }),
      )
      setMessage({ type: 'success', text: 'Brand core atualizado com sucesso.' })
    } catch (error) {
      console.error('Failed to save brand core:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar os ativos de identidade.' })
    } finally {
      setSaving(false)
    }
  }

  const governanceReadiness = [
    Boolean(config?.logoFileId),
    Boolean(config?.wordmarkFileId),
    Boolean(config?.primaryColor && config?.secondaryColor),
    Boolean(config?.titleFont && config?.bodyFont),
  ].filter(Boolean).length

  return (
    <ProjectLayout projectId={projectId} projectName={config?.projectName}>
      <div className="space-y-8 px-6">
        <FadeIn direction="down">
          <ProjectWorkspaceHero
            eyebrow="Identity command"
            title="BRAND CORE"
            description="Transforme o projeto em uma shell premium e completa, com o motor de identidade do cliente governando logo, cor, fontes, densidade e expressao visual."
            metrics={(
              <>
                <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                  Fonte de verdade visual
                </span>
                <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
                  Shell completa por projeto
                </span>
              </>
            )}
          />
        </FadeIn>

        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Brand core atualizado' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <FadeIn direction="up" delay={0.1}>
          {loading ? (
            <div className="empty-state min-h-[320px] gap-4 px-6 py-12">
              <div className="empty-state-icon animate-pulse">BC</div>
              <h2 className="text-2xl font-display font-bold text-text">Carregando identidade</h2>
              <p className="max-w-md text-center text-text-muted">
                Estamos buscando a configuracao visual atual do projeto.
              </p>
            </div>
          ) : config ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
              <BrandingForm initialData={config} onSubmit={handleSubmit} isLoading={saving} showProjectName={false} />

              <aside className="panel-shell h-fit p-6">
                <div>
                  <p className="eyebrow-label text-action-primary/70">Identity governance</p>
                  <h2 className="mt-3 text-xl font-display font-bold text-text">Camadas canônicas da marca</h2>
                  <p className="mt-3 text-sm text-text-muted">
                    A shell do projeto ja muda com este motor. Agora a meta e governar isso com mais criterio.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    { label: 'Logo principal definida', ready: Boolean(config.logoFileId) },
                    { label: 'Wordmark definida', ready: Boolean(config.wordmarkFileId) },
                    { label: 'Paleta mestre', ready: Boolean(config.primaryColor && config.secondaryColor) },
                    { label: 'Par tipografico', ready: Boolean(config.titleFont && config.bodyFont) },
                  ].map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-muted/20 px-4 py-3">
                      <span className="text-sm text-text">{entry.label}</span>
                      <span className={`summary-pill ${entry.ready ? 'border-status-success/30 bg-status-success/10 text-status-success' : 'border-status-warning/30 bg-status-warning/10 text-status-warning'}`}>
                        {entry.ready ? 'OK' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-action-primary/20 bg-action-primary/5 p-5">
                  <p className="text-sm font-semibold text-text">{governanceReadiness}/4 sinais centrais definidos</p>
                  <p className="mt-2 text-sm text-text-muted">
                    {existingProject?.businessModel
                      ? `${existingProject.niche || 'Projeto sem nicho'} • ${getBusinessModelLabel(existingProject.businessModel)}`
                      : 'Complete a identidade para fortalecer a governança visual do workspace.'}
                  </p>
                </div>
              </aside>
            </div>
          ) : (
            <StatusNotice
              tone="error"
              title="Brand core indisponivel"
              message="Nao foi possivel carregar os dados de identidade deste projeto."
              role="alert"
            />
          )}
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <ProjectDomainLibrary
            embedded
            projectId={projectId}
            projectName={config?.projectName}
            domain="BRAND_CORE"
            eyebrow="Identity vault"
            title="Biblioteca de identidade"
            description="Armazene variacoes de logo, tipografia, paletas, elementos visuais e manuais da marca dentro do mesmo projeto."
            supportsAssetUpload
            supportsLink
            primaryToggleLabel="Definir como ativo principal da categoria"
            categories={[
              { key: 'LOGOTIPOS', label: 'Logotipos' },
              { key: 'TIPOGRAFIA', label: 'Tipografia' },
              { key: 'PALETA_DE_CORES', label: 'Paleta de Cores' },
              { key: 'ELEMENTOS_VISUAIS', label: 'Elementos Visuais' },
              { key: 'MANUAL_DE_MARCA', label: 'Manual de Marca' },
            ]}
            contentLabel="Diretrizes e observacoes"
            extraFields={[
              { key: 'variant', label: 'Variacao / Uso', placeholder: 'Ex: horizontal, vertical, dark, heading, neutrals' },
              { key: 'usage', label: 'Contexto de uso', placeholder: 'Ex: homepage, shell do projeto, social kit' },
            ]}
          />
        </FadeIn>
      </div>
    </ProjectLayout>
  )
}

export const getServerSideProps: GetServerSideProps<BrandCorePageProps> = async (context) => {
  const { id } = context.params as { id: string }

  if (!id) {
    return { notFound: true }
  }

  return {
    props: { projectId: id },
  }
}
