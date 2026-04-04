import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { 
  Library, 
  Terminal, 
  Layers, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { FadeIn, BrandHealth, BrandLogo } from '@/components/atoms'
import { SkipToContent } from '@/components/atoms/SkipToContent'

/**
 * Home Page (Strategic Command Center)
 * The entry point for the elite Brand-Ops platform.
 * Features a minimalist command UI, BHI gamification, and orchestrated entry.
 */
export default function Home() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-surface-canvas selection:bg-action-primary/10 overflow-x-hidden">
      <SkipToContent contentId="main-content">Skip to Command</SkipToContent>
      <Head>
        <title>Brand-Ops | Command Center</title>
        <meta name="description" content="Strategic Brand Operations Engine" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main id="main-content" className="relative container mx-auto px-6 py-24 md:py-32">
        {/* Deep Field Gradient (Alma da Marca) */}
        <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-full -translate-x-1/2 opacity-30 blur-[120px] bg-gradient-to-b from-action-primary/10 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          {/* Header Section: Strategic Identity */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
            <FadeIn direction="down" className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <BrandLogo size={48} variant="solid" className="shadow-xl" />
                <div className="h-10 w-px bg-border/20 mx-2" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-action-primary/60">
                  Mission Protocol 1.1a
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-text leading-[0.9]">
                Comande seus <br />
                <span className="text-action-primary italic">Ativos Vivos.</span>
              </h1>
              <p className="mt-8 text-xl text-text-muted max-w-xl font-medium leading-relaxed">
                Transforme intenção estratégica em realidade visual instantânea. 
                Zero ruído. Clareza radical.
              </p>
            </FadeIn>

            {/* Gamification: Brand Health Index (BHI) Indicator */}
            <FadeIn delay={0.2} direction="left" className="flex flex-col items-center md:items-end gap-4 translate-y-4">
              <BrandHealth score={42} size="lg" label="BHI Status" />
              <div className="px-5 py-2 rounded-full glass-l2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-status-warning" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Estratégia: Necessita Decisão
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Navigation Grid (The Command Board) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <Link href="/creative-library" className="group">
              <FadeIn delay={0.3} direction="up" className="panel-shell p-10 h-full transition-all hover:border-action-primary/50 hover:bg-surface/80 group-active:scale-[0.97] glass-l2 border-white/10">
                <div className="flex items-start justify-between mb-16">
                  <div className="h-16 w-16 rounded-3xl bg-action-primary/5 flex items-center justify-center text-action-primary group-hover:bg-action-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-action-primary/20">
                    <Library className="h-8 w-8" />
                  </div>
                  <ChevronRight className="h-6 w-6 text-border/40 group-hover:text-action-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-3xl font-display font-bold text-text mb-4">{t('creative_library.title')}</h3>
                <p className="text-lg text-text-muted font-medium leading-relaxed">
                  {t('creative_library.description')}
                </p>
              </FadeIn>
            </Link>

            <Link href="/design-system" className="group">
              <FadeIn delay={0.4} direction="up" className="panel-shell p-10 h-full transition-all hover:border-action-primary/50 hover:bg-surface/80 group-active:scale-[0.97] glass-l1 border-dashed">
                <div className="flex items-start justify-between mb-16">
                  <div className="h-16 w-16 rounded-3xl bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-text group-hover:text-text-inverse transition-all duration-500">
                    <Layers className="h-8 w-8" />
                  </div>
                  <ChevronRight className="h-6 w-6 text-border/40 group-hover:text-action-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-3xl font-display font-bold text-text mb-4">Pattern Lab</h3>
                <p className="text-lg text-text-muted font-medium leading-relaxed">
                  Single Source of Truth. Visualize átomos, física rígia e a lógica espacial.
                </p>
              </FadeIn>
            </Link>
          </div>

          {/* Global Terminal Info Footer */}
          <FadeIn delay={0.6} direction="up" className="border-t border-border/20 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.4em] text-text-muted/40">
              <Terminal className="h-4 w-4" />
              <span>AIOX Brand-Ops Framework v1.0.0</span>
            </div>
            <div className="flex gap-10">
              <Link href="/design-system" className="text-[11px] font-bold uppercase tracking-widest text-text-muted/60 hover:text-action-primary transition-colors">Design Ops</Link>
              <a href="#" className="text-[11px] font-bold uppercase tracking-widest text-text-muted/60 hover:text-action-primary transition-colors">Audit Protocol</a>
              <a href="#" className="text-[11px] font-bold uppercase tracking-widest text-text-muted/60 hover:text-action-primary transition-colors">Onliness Docs</a>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  )
}
