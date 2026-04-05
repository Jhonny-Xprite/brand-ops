import Link from 'next/link'
import { useRouter } from 'next/router'

import { AppIcon, BrandSignature, DomainIcon, MotionButton, OfflineIndicator, ThemeToggle } from '@/components/atoms'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearProjectContext } from '@/store/projects/projects.slice'

export interface ProjectNavbarProps {
  projectId: string
  projectName?: string
}

export const ProjectNavbar = ({ projectId, projectName }: ProjectNavbarProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.projects.items)
  const { t } = useTranslation()

  const displayName =
    projectName || projects.find((project) => project.id === projectId)?.name || 'Projeto'

  const menuItems = [
    { key: 'overview', label: t('navigation.overview'), path: `/projeto/${projectId}`, domain: 'OVERVIEW' as const },
    { key: 'dashboard', label: t('navigation.dashboard'), path: `/projeto/${projectId}/dashboard`, domain: 'DASHBOARD' as const },
    { key: 'strategy', label: t('navigation.strategy'), path: `/projeto/${projectId}/strategy`, domain: 'STRATEGY' as const },
    { key: 'brand-core', label: t('navigation.brand_core'), path: `/projeto/${projectId}/brand-core`, domain: 'BRAND_CORE' as const },
    { key: 'media', label: t('navigation.media_library'), path: `/projeto/${projectId}/media`, domain: 'MEDIA' as const },
    { key: 'social', label: t('navigation.social'), path: `/projeto/${projectId}/social`, domain: 'SOCIAL' as const },
    { key: 'production', label: t('navigation.creatives'), path: `/projeto/${projectId}/production`, domain: 'PRODUCTION' as const },
    { key: 'copy', label: t('navigation.copywriting'), path: `/projeto/${projectId}/copy`, domain: 'COPY' as const },
    { key: 'config', label: t('navigation.config'), path: `/projeto/${projectId}/config`, domain: 'CONFIG' as const },
  ]

  const isActive = (path: string) => {
    const currentPath = router.asPath.split('#')[0]

    if (path === `/projeto/${projectId}`) {
      return router.pathname === '/projeto/[id]' && router.query.id === projectId
    }

    if (path.includes('?')) {
      return currentPath === path
    }

    if (path.endsWith('/config')) {
      return currentPath === path
    }

    return currentPath.startsWith(path)
  }

  const handleSwitchProject = async () => {
    await dispatch(clearProjectContext())
    await router.push('/')
  }

  return (
    <nav className="desktop-sidebar sticky top-0 h-screen border-r border-border/50" aria-label="Project navigation shell">
      <BrandSignature size={46} compact className="max-w-[220px]" />

      <div className="panel-shell mt-4 p-5">
        <div className="flex items-start gap-3">
          <div className="empty-state-icon h-11 w-11 rounded-2xl border-action-primary/25 bg-action-primary/12 text-action-primary">
            <DomainIcon domain="OVERVIEW" size="sm" tone="active" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow-label text-action-primary/70">{t('navigation.projeto_ativo')}</p>
            <h3 className="mt-2 truncate text-lg font-display font-bold text-text">
              {displayName}
            </h3>
            <p className="mt-2 text-xs text-text-muted">
              Workspace executivo com identidade premium, bibliotecas por dominio e shell inteira adaptada ao contexto da marca.
            </p>
          </div>
        </div>
      </div>

      <div className="desktop-sidebar-nav mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className={`desktop-nav-link text-[11px] font-bold uppercase tracking-[0.22em] ${isActive(item.path) ? 'desktop-nav-link-active shadow-md shadow-action-primary/10' : ''}`}
          >
            <span className="flex items-center gap-3">
              <DomainIcon domain={item.domain} size="sm" tone={isActive(item.path) ? 'active' : 'muted'} />
              <span>{item.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-auto space-y-4 border-t border-border/50 pt-8">
        <ThemeToggle />
        <MotionButton
          variant="ghost"
          onClick={() => void handleSwitchProject()}
          className="flex items-center justify-center gap-2 border border-border/60 bg-surface-muted/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-text"
        >
          <AppIcon name="switchProject" size="sm" decorative />
          {t('navigation.trocar_projeto')}
        </MotionButton>
        <OfflineIndicator />
      </div>
    </nav>
  )
}

export default ProjectNavbar
