import type { ReactNode } from 'react'

interface ProjectWorkspaceHeroProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  metrics?: ReactNode
}

export function ProjectWorkspaceHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
}: ProjectWorkspaceHeroProps) {
  return (
    <section className="brand-hero-panel panel-shell relative overflow-hidden px-8 py-8">
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow-label text-action-primary/70">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-display font-bold text-text xl:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-text-muted">{description}</p>
          {metrics ? <div className="mt-6 flex flex-wrap gap-3">{metrics}</div> : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
      </div>
    </section>
  )
}

export default ProjectWorkspaceHero
