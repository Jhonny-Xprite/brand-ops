import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/Projects/ProjectCard'
import { ProjectListRow } from '@/components/Projects/ProjectListRow'
import { ViewToggle } from '@/components/Projects/ViewToggle'
import { ProjectSearch } from '@/components/Projects/ProjectSearch'
import { CreateProjectModal } from '@/components/Projects/CreateProjectModal'
import { SyncStatusFooter } from '@/components/Projects/SyncStatusFooter'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  logoUrl?: string
  assetCount: number
  createdAt: string
}

/**
 * Home Page - Project Selection Screen (Story 0.2)
 * Displays all user projects in grid or list view with search and creation capabilities
 */
export default function Home() {
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

  // Restore view preference from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('projectsViewMode') as 'grid' | 'list' | null
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
    setMounted(true)
  }, [])

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Persist view mode to localStorage
  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode)
    localStorage.setItem('projectsViewMode', newMode)
  }


  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    // TODO: Navigate to project context/details page
    console.log('Selected project:', projectId)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Projetos - Brand-Ops</title>
        <meta name="description" content="Selecione um projeto para começar" />
      </Head>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meus Projetos</h1>
                <p className="text-gray-600 mt-2">
                  {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} disponível{projects.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* New Project Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Novo Projeto
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-6">
              <ProjectSearch projects={projects} onFilterChange={setFilteredProjects} />
              <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
            </div>
          </div>
        </div>

        {/* Projects Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
          {error && !loading && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                Erro ao carregar projetos: {error}
              </p>
            </div>
          )}

          {loading && !projects.length ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando projetos...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-gray-400 mb-4">📁</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum projeto encontrado
              </h2>
              <p className="text-gray-600 mb-6">
                {projects.length === 0
                  ? 'Crie seu primeiro projeto para começar'
                  : 'Nenhum projeto corresponde à sua busca'}
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Criar Primeiro Projeto
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  {...project}
                  onSelect={handleSelectProject}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Logo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Assets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Criado em
                    </th>
                    <th className="px-6 py-3" />
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
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects()}
      />

      {/* Sync Status Footer */}
      <SyncStatusFooter
        syncStatus={syncStatus}
        error={syncError}
        onRetry={retry}
      />
    </div>
  )
}
