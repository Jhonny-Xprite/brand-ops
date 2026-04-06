import React from 'react'
import Image from 'next/image'

import { getBusinessModelLabel, type ProjectBusinessModel } from '@/lib/projectDomain'
import { AppIcon, BrandLogo, DomainIcon } from '@brand-ops/ui/atoms'

interface ProjectCardProps {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  onSelect: React.Dispatch<string>
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  niche,
  businessModel,
  logoUrl,
  assetCount,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="panel-shell brand-card group relative flex h-full flex-col overflow-hidden p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-action-primary/30 hover:shadow-[0_28px_60px_-30px_rgba(124,58,237,0.45)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-action-primary/22 via-action-primary/6 to-action-secondary/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-surface-muted/70 shadow-sm">
          {logoUrl ? (
            <div className="relative h-14 w-14">
              <Image src={logoUrl} alt={name} fill className="object-contain" sizes="56px" />
            </div>
          ) : (
            <BrandLogo size={56} variant="solid" />
          )}
        </div>

        <div className="status-badge status-badge-success">
          <DomainIcon domain="OVERVIEW" size="xs" tone="success" decorative />
          <span>{assetCount} ativos</span>
        </div>
      </div>

      <div className="relative mt-8">
        <p className="eyebrow-label text-action-primary/70">Projeto</p>
        <h3 className="mt-3 line-clamp-2 text-2xl font-display font-bold tracking-tight text-text">
          {name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-text-muted">{`${niche} · ${getBusinessModelLabel(businessModel)}`}</p>
      </div>

      <div className="relative mt-8 flex items-center justify-between border-t border-border/50 pt-5 text-xs font-bold uppercase tracking-[0.24em] text-text-muted">
        <span>Workspace premium</span>
        <span className="inline-flex items-center gap-2 text-action-primary transition-transform duration-200 group-hover:translate-x-1">
          <AppIcon name="overview" size="xs" tone="active" decorative />
          Abrir
        </span>
      </div>
    </button>
  )
}

export default ProjectCard
