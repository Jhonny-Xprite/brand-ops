import React from 'react'
import { Grid3X3, List } from 'lucide-react'

interface ViewToggleProps {
  viewMode: 'grid' | 'list'
  onChange: React.Dispatch<'grid' | 'list'>
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div className="segmented-control">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`segmented-control-button flex items-center gap-2 ${
          viewMode === 'grid' ? 'segmented-control-button-active' : ''
        }`}
        title="Grid view"
        aria-label="Visualizar em grade"
      >
        <Grid3X3 size={16} />
        Grade
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={`segmented-control-button flex items-center gap-2 ${
          viewMode === 'list' ? 'segmented-control-button-active' : ''
        }`}
        title="List view"
        aria-label="Visualizar em lista"
      >
        <List size={16} />
        Lista
      </button>
    </div>
  )
}

export default ViewToggle
