import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import ActivityFeed from '@/components/Dashboard/ActivityFeed'
import ProductionChart from '@/components/Dashboard/ProductionChart'
import StatCard from '@/components/Dashboard/StatCard'
import { FadeIn, MotionButton } from '@brand-ops/ui/atoms'
import ProjectLayout from '@/components/Layout/ProjectLayout'
import ProjectWorkspaceHero from '@/components/Layout/ProjectWorkspaceHero'
import { StatusNotice } from '@brand-ops/ui/molecules'

interface DashboardPageProps {
  projectId: string
}

interface DashboardData {
  project: {
    id: string
    name: string
    niche: string
    businessModel: string
    businessModelLabel: string
    logoUrl?: string
    socialLinks: {
      instagramUrl?: string
      youtubeUrl?: string
      facebookUrl?: string
      tiktokUrl?: string
    }
  }
  summary: {
    totalAssets: number
    inProgressAssets: number
    totalStorageBytes: string
  }
  timeline: Array<{
    date: string
    count: number
  }>
  activities: Array<{
    id: string
    message: string
    updatedAt: string
  }>
  domainHealth: Array<{
    domain: string
    label: string
    total: number
    ready: number
    attention: number
    href: string
    actionLabel: string
    state: 'empty' | 'attention' | 'ready'
  }>
}

function formatStorage(bytes: string): string {
  const numeric = Number(bytes)
  if (!numeric) {
    return '0 MB'
  }

  if (numeric >= 1024 * 1024 * 1024) {
    return `${(numeric / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return `${(numeric / (1024 * 1024)).toFixed(1)} MB`
}

export default function DashboardPage({ projectId }: DashboardPageProps) {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('7d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projeto/${projectId}/stats?period=${period}`)
        if (!response.ok) {
          throw new Error('Nao foi possivel carregar o dashboard do projeto.')
        }

        const result = (await response.json()) as DashboardData
        setData(result)
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : 'Nao foi possivel carregar o dashboard do projeto.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [period, projectId])

  const summaryCards = useMemo(
    () =>
      data
        ? [
            {
              label: 'Ativos totais',
              value: String(data.summary.totalAssets),
              helper: 'Quantidade total de ativos vinculados a este projeto no periodo.',
              iconName: 'media' as const,
            },
            {
              label: 'Em andamento',
              value: String(data.summary.inProgressAssets),
              helper: 'Arquivos que ainda nao chegaram a um estado final de aprovacao.',
              iconName: 'production' as const,
            },
            {
              label: 'Armazenamento',
              value: formatStorage(data.summary.totalStorageBytes),
              helper: 'Volume total armazenado pelos ativos atualmente ligados ao projeto.',
              iconName: 'dashboard' as const,
            },
          ]
        : [],
    [data],
  )

  return (
    <ProjectLayout projectId={projectId} projectName={data?.project.name}>
      <div className="space-y-8 px-6">
        <FadeIn direction="down">
          <ProjectWorkspaceHero
            eyebrow="Command center"
            title="DASHBOARD"
            description="Leitura executiva do projeto com volume de ativos, ritmo de entrega e atividade recente dentro da mesma linguagem visual da Creative Library."
            actions={(
              <>
                {[
                  { value: 'today', label: 'Hoje' },
                  { value: '7d', label: '7 dias' },
                  { value: '30d', label: '30 dias' },
                ].map((option) => (
                  <MotionButton
                    key={option.value}
                    variant={period === option.value ? 'primary' : 'secondary'}
                    onClick={() => setPeriod(option.value as 'today' | '7d' | '30d')}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                  >
                    {option.label}
                  </MotionButton>
                ))}
              </>
            )}
          />
        </FadeIn>

        {error ? (
          <StatusNotice tone="error" title="Dashboard indisponivel" message={error} role="alert" />
        ) : null}

        {loading ? (
          <div className="empty-state min-h-[320px] gap-4 px-6 py-12">
            <div className="empty-state-icon animate-pulse">BO</div>
            <h2 className="text-2xl font-display font-bold text-text">Carregando metricas</h2>
            <p className="max-w-md text-center text-text-muted">
              Estamos consolidando os dados do projeto para abrir sua visao operacional.
            </p>
          </div>
        ) : data ? (
          <>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,1fr,1fr,1fr]">
              <article className="panel-shell p-6">
                <p className="eyebrow-label text-action-primary/70">Ficha do Projeto</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-surface-muted/60">
                    {data.project.logoUrl ? (
                      <img src={data.project.logoUrl} alt={data.project.name} className="h-full w-full object-contain p-3" />
                    ) : (
                      <span className="text-lg font-display font-bold text-text-muted">BO</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-display font-bold text-text">{data.project.name}</h2>
                    <p className="mt-2 text-sm text-text-muted">{data.project.niche}</p>
                    <span className="summary-pill mt-3 inline-flex border-action-primary/20 bg-action-primary/10 text-action-primary">
                      {data.project.businessModelLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {[
                    ['Instagram', data.project.socialLinks.instagramUrl],
                    ['YouTube', data.project.socialLinks.youtubeUrl],
                    ['Facebook', data.project.socialLinks.facebookUrl],
                    ['TikTok', data.project.socialLinks.tiktokUrl],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border/60 bg-surface-muted/30 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{label}</p>
                      <p className="mt-2 truncate text-sm text-text">{value || 'Nao configurado'}</p>
                    </div>
                  ))}
                </div>
              </article>

              {summaryCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </section>

            <section className="panel-shell p-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="eyebrow-label text-action-primary/70">Readiness matrix</p>
                  <h2 className="mt-3 text-2xl font-display font-bold text-text">Saude operacional por dominio</h2>
                  <p className="mt-3 max-w-3xl text-sm text-text-muted">
                    Veja onde a marca esta pronta, onde ha riscos e para qual menu o time deve ir agora.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-4">
                {data.domainHealth.map((domain) => (
                  <article
                    key={domain.domain}
                    className={`rounded-[1.75rem] border px-5 py-5 shadow-sm ${
                      domain.state === 'ready'
                        ? 'border-status-success/30 bg-status-success/8'
                        : domain.state === 'attention'
                          ? 'border-status-warning/30 bg-status-warning/8'
                          : 'border-border/60 bg-surface-muted/20'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="summary-pill border-border/60 bg-surface-muted/20 text-text-muted">
                        {domain.label}
                      </span>
                      <span
                        className={`summary-pill ${
                          domain.state === 'ready'
                            ? 'border-status-success/30 bg-status-success/10 text-status-success'
                            : domain.state === 'attention'
                              ? 'border-status-warning/30 bg-status-warning/10 text-status-warning'
                              : 'border-border/60 bg-surface-muted/20 text-text-muted'
                        }`}
                      >
                        {domain.state === 'ready' ? 'Estavel' : domain.state === 'attention' ? 'Exige revisao' : 'Vazio'}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-display font-bold text-text">{domain.total} item(ns)</h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {domain.ready} pronto(s), {domain.attention} em revisao ou pendente(s).
                    </p>
                    <Link
                      href={domain.href}
                      className="mt-5 inline-flex items-center text-sm font-semibold text-action-primary transition hover:text-action-primary-hover"
                    >
                      {domain.actionLabel}
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr,1fr]">
              <div className="panel-shell p-6">
                <div className="mb-6">
                  <p className="eyebrow-label text-action-primary/70">Timeline</p>
                  <h2 className="mt-3 text-2xl font-display font-bold text-text">Producao por periodo</h2>
                </div>
                <ProductionChart items={data.timeline} />
              </div>

              <div className="panel-shell p-6">
                <div className="mb-6">
                  <p className="eyebrow-label text-action-primary/70">Activity</p>
                  <h2 className="mt-3 text-2xl font-display font-bold text-text">Ultimas atualizacoes</h2>
                </div>
                <ActivityFeed items={data.activities} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </ProjectLayout>
  )
}

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (context) => {
  const { id } = context.params as { id: string }

  if (!id) {
    return { notFound: true }
  }

  return {
    props: {
      projectId: id,
    },
  }
}
