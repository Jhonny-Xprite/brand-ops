import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'

import ProjectSettingsForm, {
  type ProjectSettingsFormData,
} from '@/components/Config/ProjectSettingsForm'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { FadeIn } from '@/components/atoms'
import { StatusNotice } from '@/components/molecules'
import { getBusinessModelLabel } from '@/lib/projectDomain'
import { useAppDispatch } from '@/store'
import { upsertProject } from '@/store/projects/projects.slice'

interface ConfigPageProps {
  projectId: string
}

interface ConfigResponse extends ProjectSettingsFormData {
  projectId: string
  createdAt: string
  updatedAt: string
}

export default function ConfigPage({ projectId }: ConfigPageProps) {
  const legacyNicheFallback = 'Nicho nao definido'
  const dispatch = useAppDispatch()
  const [config, setConfig] = useState<ProjectSettingsFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      setMessage(null)

      try {
        const response = await fetch(`/api/projeto/${projectId}/config`)
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({ error: null }))) as { error?: string | null }
          throw new Error(payload.error || 'Nao foi possivel carregar as configuracoes do projeto.')
        }

        const data = (await response.json()) as ConfigResponse
        setConfig({
          projectName: data.projectName,
          niche: data.niche || legacyNicheFallback,
          businessModel: data.businessModel,
          instagramUrl: data.instagramUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          facebookUrl: data.facebookUrl || '',
          tiktokUrl: data.tiktokUrl || '',
        })

        dispatch(
          upsertProject({
            id: projectId,
            name: data.projectName,
            niche: data.niche || legacyNicheFallback,
            businessModel: data.businessModel,
            assetCount: 0,
            createdAt: data.createdAt,
            socialLinks: {
              instagramUrl: data.instagramUrl || undefined,
              youtubeUrl: data.youtubeUrl || undefined,
              facebookUrl: data.facebookUrl || undefined,
              tiktokUrl: data.tiktokUrl || undefined,
            },
          }),
        )
      } catch (error) {
        console.error('Failed to fetch config:', error)
        setMessage({ type: 'error', text: 'Erro ao carregar configuracoes gerais do projeto.' })
      } finally {
        setLoading(false)
      }
    }

    void fetchConfig()
  }, [dispatch, projectId])

  const handleSubmit = async (data: ProjectSettingsFormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/projeto/${projectId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: null }))) as { error?: string | null }
        throw new Error(payload.error || 'Nao foi possivel salvar as configuracoes do projeto.')
      }

      const result = (await response.json()) as ConfigResponse
      setConfig({
        projectName: result.projectName,
        niche: result.niche,
        businessModel: result.businessModel,
        instagramUrl: result.instagramUrl || '',
        youtubeUrl: result.youtubeUrl || '',
        facebookUrl: result.facebookUrl || '',
        tiktokUrl: result.tiktokUrl || '',
      })
      dispatch(
        upsertProject({
          id: projectId,
          name: result.projectName,
          niche: result.niche,
          businessModel: result.businessModel,
          assetCount: 0,
          createdAt: result.createdAt,
          socialLinks: {
            instagramUrl: result.instagramUrl || undefined,
            youtubeUrl: result.youtubeUrl || undefined,
            facebookUrl: result.facebookUrl || undefined,
            tiktokUrl: result.tiktokUrl || undefined,
          },
        }),
      )
      setMessage({ type: 'success', text: 'Configuracoes gerais atualizadas com sucesso.' })
    } catch (error) {
      console.error('Failed to save config:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configuracoes gerais do projeto.' })
    } finally {
      setSaving(false)
    }
  }

  const businessModelLabel = config ? getBusinessModelLabel(config.businessModel) : null
  const projectCompletion = config
    ? [
        Boolean(config.projectName.trim()),
        Boolean(config.niche.trim()),
        Boolean(config.businessModel),
        Boolean(
          config.instagramUrl.trim() ||
            config.youtubeUrl.trim() ||
            config.facebookUrl.trim() ||
            config.tiktokUrl.trim(),
        ),
      ].filter(Boolean).length
    : 0

  return (
    <ProjectLayout projectId={projectId} projectName={config?.projectName}>
      <div className="space-y-8 px-6">
        <FadeIn direction="down">
          <ProjectWorkspaceHero
            eyebrow="Workspace settings"
            title="CONFIGS"
            description="Gerencie o nome do projeto, nicho, modelo de negocio e links institucionais sem misturar esta superficie com os ativos de identidade visual."
            metrics={
              config ? (
                <>
                  <span className="summary-pill border-border/60 bg-surface-muted/40 text-text">{config.niche}</span>
                  <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
                    {businessModelLabel}
                  </span>
                </>
              ) : undefined
            }
          />
        </FadeIn>

        {message ? (
          <StatusNotice
            tone={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Configuracoes atualizadas' : 'Atencao necessaria'}
            message={message.text}
            role={message.type === 'success' ? 'status' : 'alert'}
          />
        ) : null}

        <FadeIn direction="up" delay={0.1}>
          {loading ? (
            <div className="empty-state min-h-[320px] gap-4 px-6 py-12">
              <div className="empty-state-icon animate-pulse">CF</div>
              <h2 className="text-2xl font-display font-bold text-text">Carregando configuracoes</h2>
              <p className="max-w-md text-center text-text-muted">
                Estamos buscando o perfil geral deste projeto para abrir suas configuracoes.
              </p>
            </div>
          ) : config ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <ProjectSettingsForm initialData={config} onSubmit={handleSubmit} isLoading={saving} />

              <aside className="panel-shell h-fit p-6">
                <div>
                  <p className="eyebrow-label text-action-primary/70">Workspace health</p>
                  <h2 className="mt-3 text-xl font-display font-bold text-text">Completude operacional</h2>
                  <p className="mt-3 text-sm text-text-muted">
                    Use esta superficie para garantir que o projeto esta pronto para social, dashboard e roteamento interno.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    {
                      label: 'Nome do projeto',
                      ready: Boolean(config.projectName.trim()),
                    },
                    {
                      label: 'Nicho definido',
                      ready: Boolean(config.niche.trim()),
                    },
                    {
                      label: 'Modelo de negocio',
                      ready: Boolean(config.businessModel),
                    },
                    {
                      label: 'Ao menos um link institucional',
                      ready: Boolean(
                        config.instagramUrl.trim() ||
                          config.youtubeUrl.trim() ||
                          config.facebookUrl.trim() ||
                          config.tiktokUrl.trim(),
                      ),
                    },
                  ].map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-muted/20 px-4 py-3">
                      <span className="text-sm text-text">{entry.label}</span>
                      <span
                        className={`summary-pill ${entry.ready ? 'border-status-success/30 bg-status-success/10 text-status-success' : 'border-status-warning/30 bg-status-warning/10 text-status-warning'}`}
                      >
                        {entry.ready ? 'OK' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-action-primary/20 bg-action-primary/5 p-5">
                  <p className="text-sm font-semibold text-text">
                    {projectCompletion}/4 blocos essenciais preenchidos
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Quanto mais completo este console estiver, melhor o dashboard, a social layer e a leitura executiva do projeto.
                  </p>
                </div>
              </aside>
            </div>
          ) : (
            <StatusNotice
              tone="error"
              title="Configuracao indisponivel"
              message="Nao foi possivel carregar os dados gerais deste projeto."
              role="alert"
            />
          )}
        </FadeIn>
      </div>
    </ProjectLayout>
  )
}

export const getServerSideProps: GetServerSideProps<ConfigPageProps> = async (context) => {
  const { id } = context.params as { id: string }

  if (!id) {
    return { notFound: true }
  }

  return {
    props: { projectId: id },
  }
}
