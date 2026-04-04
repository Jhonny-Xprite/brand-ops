import React from 'react'
import Image from 'next/image'

interface ProjectCardProps {
  id: string
  name: string
  logoUrl?: string
  assetCount: number
  onSelect: (id: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  logoUrl,
  assetCount,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className="flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
    >
      {/* Logo */}
      <div className="w-24 h-24 mb-4 flex items-center justify-center rounded bg-gray-100">
        {logoUrl ? (
          <div className="relative w-20 h-20">
            <Image
              src={logoUrl}
              alt={name}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Project Name */}
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2 line-clamp-2">
        {name}
      </h3>

      {/* Asset Count Badge */}
      <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
        {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
      </div>
    </div>
  )
}

export default ProjectCard
