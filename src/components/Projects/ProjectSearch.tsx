import React, { useState, useCallback, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Project } from '@/store/projects/projects.slice'

interface ProjectSearchProps {
  projects: Project[]
  onFilterChange: React.Dispatch<React.SetStateAction<Project[]>>
}

export const ProjectSearch: React.FC<ProjectSearchProps> = ({
  projects,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  React.useEffect(() => {
    onFilterChange(filteredProjects)
  }, [filteredProjects, onFilterChange])

  const handleClear = useCallback(() => {
    setSearchQuery('')
  }, [])

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Buscar projetos, squads ou operacoes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-11 pr-12"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition hover:bg-surface hover:text-text"
            title="Limpar"
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-2 min-h-[1.25rem] text-xs font-medium text-text-muted">
        {searchQuery
          ? filteredProjects.length === 0
            ? 'Nenhum projeto corresponde a busca atual.'
            : `${filteredProjects.length} projeto${filteredProjects.length !== 1 ? 's' : ''} em foco`
          : 'Busque por nome para reduzir o workspace em vista.'}
      </div>
    </div>
  )
}

export default ProjectSearch
