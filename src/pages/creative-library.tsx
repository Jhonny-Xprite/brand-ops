import Link from 'next/link'

import { BrandLogo, OfflineIndicator, ThemeToggle } from '@/components/atoms'
import CreativeLibraryWorkspace from '@/components/CreativeLibrary/CreativeLibraryWorkspace'

const CreativeLibraryPage = () => {
  return (
    <div className="desktop-app-shell bg-surface-canvas/30">
      <nav
        className="desktop-sidebar sticky top-0 h-screen border-r border-border/50"
        aria-label="Creative navigation shell"
      >
        <div className="flex items-center space-x-4">
          <BrandLogo size={44} variant="solid" />
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight text-text">Brand Ops</h2>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-action-primary">Creative shell</p>
          </div>
        </div>

        <div className="desktop-sidebar-nav mt-4">
          <Link href="/" className="desktop-nav-link">
            Projetos
          </Link>
          <Link href="/creative-library" className="desktop-nav-link desktop-nav-link-active shadow-md shadow-action-primary/10">
            Creative Library
          </Link>
          <Link href="/design-system" className="desktop-nav-link">
            Design System
          </Link>
        </div>

        <div className="panel-shell mt-4 p-6">
          <h2 className="eyebrow-label text-action-primary/80">Workspace global</h2>
          <p className="mt-3 text-sm font-medium text-text">
            Biblioteca transversal para ativos sem contexto exclusivo de projeto.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            Cada projeto agora pode operar sua propria Creative Library em `/projeto/[id]/media`, enquanto esta superficie continua servindo como curadoria global.
          </p>
        </div>

        <div className="mt-auto space-y-4 border-t border-border/50 pt-8">
          <ThemeToggle />
          <OfflineIndicator />
        </div>
      </nav>

      <CreativeLibraryWorkspace />
    </div>
  )
}

export default CreativeLibraryPage
