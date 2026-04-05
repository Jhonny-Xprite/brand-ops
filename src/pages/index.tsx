import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Plus } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useAppDispatch } from '@/store'
import { setActiveProjectId } from '@/store/projects/projects.slice'
import type { Project } from '@/store/projects/projects.slice'
import { BrandSignature, FadeIn, MotionButton } from '@/components/atoms'
import { StatusNotice } from '@/components/molecules'
import { ProjectCard } from '@/components/Projects/ProjectCard'
import { ProjectListRow } from '@/components/Projects/ProjectListRow'
import { ViewToggle } from '@/components/Projects/ViewToggle'
import { ProjectSearch } from '@/components/Projects/ProjectSearch'
import { CreateProjectModal } from '@/components/Projects/CreateProjectModal'
import { SyncStatusFooter } from '@/components/Projects/SyncStatusFooter'

/**
 * Home Page - Project Selection Screen (Story 0.2)
 * Displays all user projects in grid or list view with search and creation capabilities
 */
export default function Home() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [mounted, setMounted] = useState(false)

  const {
    projects,
    loading,
    error,
    syncStatus,
    syncError,
    fetchProjects,
    retry,
  } = useProjects()

  useEffect(() => {
    const savedViewMode = localStorage.getItem('projectsViewMode') as 'grid' | 'list' | null
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }

    dispatch(setActiveProjectId(null))
    setMounted(true)
  }, [dispatch])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode)
    localStorage.setItem('projectsViewMode', newMode)
  }

  const handleSelectProject = (projectId: string) => {
    dispatch(setActiveProjectId(projectId))
    void router.push(`/projeto/${projectId}`)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-canvas text-text">
      <Head>
        <title>Projetos - Brand-Ops</title>
        <meta name="description" content="Selecione um projeto para comecar" />
      </Head>

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10">
        <FadeIn direction="down">
          <section className="brand-hero-panel panel-shell relative overflow-hidden px-8 py-10">
            <div className="relative flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <BrandSignature size={64} className="max-w-xl" />
                <h1 className="mt-8 text-5xl font-display font-bold tracking-tight text-text">
                  Meus Projetos
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
                  Gerencie operacoes de marca, shell premium, bibliotecas e producao com uma experiencia high ticket que preserva clareza executiva em qualquer modo.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 xl:items-end">
                <div className="summary-pill bg-surface-muted/50 border-border/50 text-text">
                  {projects.length} {projects.length === 1 ? 'projeto pronto' : 'projetos prontos'}
                </div>
                <MotionButton
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em]"
                >
                  <Plus size={16} />
                  Novo Projeto
                </MotionButton>
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn direction="up" delay={0.1} className="mt-8">
          <section className="panel-shell px-6 py-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <ProjectSearch projects={projects} onFilterChange={setFilteredProjects} />
              <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
            </div>
          </section>
        </FadeIn>

        <FadeIn direction="up" delay={0.2} className="mt-8 flex-1">
          {error && !loading ? (
            <StatusNotice
              className="mb-6"
              tone="error"
              title="Atenção necessária"
              message={`Erro ao carregar projetos: ${error}`}
              role="alert"
            />
          ) : null}

          {loading && !projects.length ? (
            <div className="empty-state min-h-[360px] gap-4 px-6 py-12">
              <div className="empty-state-icon animate-pulse">BO</div>
              <h2 className="text-2xl font-display font-bold text-text">Carregando seu hub</h2>
              <p className="max-w-md text-center text-text-muted">
                Estamos sincronizando a lista de projetos para reabrir seu workspace sem perder contexto.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state min-h-[360px] gap-5 px-6 py-12">
              <div className="empty-state-icon">BO</div>
              <h2 className="text-2xl font-display font-bold text-text">
                Nenhum projeto encontrado
              </h2>
              <p className="max-w-lg text-center text-text-muted">
                {projects.length === 0
                  ? 'Crie seu primeiro projeto para abrir o shell operacional da marca.'
                  : 'Ajuste a busca atual ou limpe os filtros para voltar ao hub completo.'}
              </p>
              {projects.length === 0 ? (
                <MotionButton
                  variant="secondary"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em]"
                >
                  <Plus size={16} />
                  Criar Primeiro Projeto
                </MotionButton>
              ) : null}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  {...project}
                  onSelect={handleSelectProject}
                />
              ))}
            </div>
          ) : (
            <div className="panel-shell overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border/60 bg-surface-muted/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-text-muted">
                      Logo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-text-muted">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-text-muted">
                      Ativos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-text-muted">
                      Criado em
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <ProjectListRow
                      key={project.id}
                      {...project}
                      onSelect={handleSelectProject}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FadeIn>
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSelectProject}
      />

      <SyncStatusFooter
        syncStatus={syncStatus}
        error={syncError}
        onRetry={retry}
      />
    </div>
  )
}
