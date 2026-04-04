import React, { useState, useCallback, useMemo } from 'react'
import { Search, X } from 'lucide-react'

interface Project {
  id: string
  name: string
  logoUrl?: string
  assetCount: number
  createdAt: string
}

interface ProjectSearchProps {
  projects: Project[]
  onFilterChange: (filtered: Project[]) => void
}

export const ProjectSearch: React.FC<ProjectSearchProps> = ({
  projects,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Debounced filter
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  // Notify parent of filtered results
  React.useEffect(() => {
    onFilterChange(filteredProjects)
  }, [filteredProjects, onFilterChange])

  const handleClear = useCallback(() => {
    setSearchQuery('')
  }, [])

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Limpar"
            aria-label="Limpar busca"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="absolute top-full left-0 mt-2 text-xs text-gray-500">
          {filteredProjects.length === 0
            ? 'Nenhum projeto encontrado'
            : `${filteredProjects.length} projeto${filteredProjects.length !== 1 ? 's' : ''} encontrado${filteredProjects.length !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  )
}

export default ProjectSearch
