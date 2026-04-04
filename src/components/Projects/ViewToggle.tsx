import React from 'react'
import { Grid3X3, List } from 'lucide-react'

interface ViewToggleProps {
  viewMode: 'grid' | 'list'
  onChange: (mode: 'grid' | 'list') => void
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
      {/* Grid View Button */}
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center px-4 py-2 rounded transition-colors ${
          viewMode === 'grid'
            ? 'bg-blue-100 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Grid view"
        aria-label="Visualizar em grade"
      >
        <Grid3X3 size={20} />
      </button>

      {/* List View Button */}
      <button
        onClick={() => onChange('list')}
        className={`flex items-center justify-center px-4 py-2 rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-blue-100 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="List view"
        aria-label="Visualizar em lista"
      >
        <List size={20} />
      </button>
    </div>
  )
}

export default ViewToggle
