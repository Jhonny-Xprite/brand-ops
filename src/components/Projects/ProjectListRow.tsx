import React from 'react'
import Image from 'next/image'

interface ProjectListRowProps {
  id: string
  name: string
  logoUrl?: string
  assetCount: number
  createdAt: string
  onSelect: (id: string) => void
}

export const ProjectListRow: React.FC<ProjectListRowProps> = ({
  id,
  name,
  logoUrl,
  assetCount,
  createdAt,
  onSelect,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR')

  return (
    <tr
      onClick={() => onSelect(id)}
      className="hover:bg-gray-50 border-b border-gray-200 cursor-pointer transition-colors"
    >
      {/* Logo */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
          {logoUrl ? (
            <div className="relative w-8 h-8">
              <Image
                src={logoUrl}
                alt={name}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </td>

      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{name}</div>
      </td>

      {/* Asset Count */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{assetCount} assets</div>
      </td>

      {/* Created Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </td>

      {/* Action Arrow */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-gray-400 hover:text-gray-600">→</div>
      </td>
    </tr>
  )
}

export default ProjectListRow
