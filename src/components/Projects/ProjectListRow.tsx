import { getBusinessModelLabel, type ProjectBusinessModel } from '@/lib/projectDomain'
import React from 'react'
import Image from 'next/image'
import { AppIcon, BrandLogo } from '@brand-ops/ui/atoms'

interface ProjectListRowProps {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  createdAt: string
  onSelect: React.Dispatch<string>
}

export const ProjectListRow: React.FC<ProjectListRowProps> = ({
  id,
  name,
  niche,
  businessModel,
  logoUrl,
  assetCount,
  createdAt,
  onSelect,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR')

  return (
    <tr
      onClick={() => onSelect(id)}
      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-surface-muted/30"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-surface-muted/60">
          {logoUrl ? (
            <div className="relative h-8 w-8">
              <Image
                src={logoUrl}
                alt={name}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
          ) : (
            <BrandLogo size={32} variant="solid" />
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-semibold text-text">{name}</div>
          <div className="mt-1 text-xs text-text-muted">{niche} · {getBusinessModelLabel(businessModel)}</div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="status-badge status-badge-success">
          {assetCount} ativos
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-text-muted">{formattedDate}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-2 text-action-primary">
          <span className="text-xs font-bold uppercase tracking-[0.24em]">Abrir</span>
          <AppIcon name="overview" size="sm" tone="active" decorative />
        </div>
      </td>
    </tr>
  )
}

export default ProjectListRow
