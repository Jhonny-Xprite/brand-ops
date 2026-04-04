import Head from 'next/head'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Layers, 
  Zap, 
  Command, 
  Terminal,
  Box,
  Cpu
} from 'lucide-react'
import { 
  BrandHealth, 
  BrandLogo,
  MotionButton
} from '@/components/atoms'
import { MotionSandbox } from '@/components/molecules'

/**
 * Pattern Lab 2.0 (Design Ops Edition)
 * The definitive engineering reference for the Brand-Ops platform.
 * Features 3D Spatial Logic, Motion Physics Lab, and Strategic Emotion documentation.
 */
export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-surface-canvas text-text selection:bg-action-primary/10">
      <Head>
        <title>Pattern Lab 2.0 | Design Ops</title>
        <meta name="description" content="Brand-Ops Engineering & Interaction Guidelines" />
      </Head>

      <div className="container mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-text-muted hover:text-action-primary transition-all mb-16">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Protocol: Hub
        </Link>

        {/* Header Section */}
        <header className="max-w-4xl mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-action-primary flex items-center justify-center text-white shadow-xl shadow-action-primary/20">
              <Command className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-action-primary/60">
              Design Ops v2.1
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[0.9] mb-8">
            Pattern Lab <span className="text-action-primary">2.0</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl font-medium leading-relaxed">
            Aqui a estratégia se torna tangível. Documentamos a física, o vidro e a emoção que compõem o sistema do Brand-Ops.
          </p>
        </header>

        {/* 1. Lógica Espacial: 3D Logic Explorer */}
        <section className="mb-32">
          <header className="mb-12">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Layers className="h-6 w-6 text-action-primary" />
              01. Lógica Espacial (3D Stack)
            </h2>
            <p className="text-text-muted mt-2 font-medium">Visualize a hierarquia de profundidade do sistema Glassmorphism.</p>
          </header>

          <div className="perspective-container perspective-viewer grid grid-cols-1 lg:grid-cols-2 gap-20 items-center justify-items-center py-20 glass-l1 rounded-[40px]">
            <div className="relative h-[300px] w-[300px] transform-style:preserve-3d -rotate-y-[30deg]">
              {/* L3: Command Level */}
              <div className="perspective-layer layer-l3 absolute inset-0 glass-l3 rounded-[32px] border-white/20 flex flex-col items-center justify-center text-white shadow-2xl p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-action-primary mb-2">L3: Command</span>
                <div className="h-10 w-10 rounded-xl bg-action-primary mb-4" />
                <div className="h-2 w-24 bg-white/20 rounded-full" />
              </div>
              {/* L2: Panel Level */}
              <div className="perspective-layer layer-l2 absolute inset-0 translate-y-8 glass-l2 rounded-[32px] border-white/10 flex flex-col items-center justify-center text-white/60">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-2">L2: Panel</span>
                <div className="h-2 w-32 bg-white/10 rounded-full" />
              </div>
              {/* L1: Foundation Level */}
              <div className="perspective-layer layer-l1 absolute inset-0 translate-y-16 glass-l1 rounded-[32px] border-white/5 flex flex-col items-center justify-center text-white/30">
                <span className="text-[10px] font-bold uppercase tracking-widest">L1: Foundation</span>
              </div>
            </div>

            <div className="space-y-8 max-w-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-lg">Z-Index & Blur Tokens</h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  Utilizamos três níveis de profundidade tátil. Passe o mouse para explodir as camadas.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  { level: 'L1', tag: 'Foundation', css: 'glass-l1', detail: 'Backdrop Blur 16px' },
                  { level: 'L2', tag: 'Navigation', css: 'glass-l2', detail: 'Backdrop Blur 24px' },
                  { level: 'L3', tag: 'Overlays', css: 'glass-l3', detail: 'Backdrop Blur 40px' }
                ].map(item => (
                  <li key={item.level} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-text-inverse text-text font-mono font-bold">{item.level}</span>
                    <div>
                      <div className="text-sm font-bold">{item.tag}</div>
                      <div className="text-[10px] font-mono text-text-muted">{item.detail} | .{item.css}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Atomic Atoms: Buttons */}
        <section className="mb-32">
          <header className="mb-12">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Box className="h-6 w-6 text-action-primary" />
              02. Botões Atômicos (Core Interactions)
            </h2>
            <p className="text-text-muted mt-2 font-medium">Padronização de cliques com física de mola integrada.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] glass-l1 border-white/5 flex flex-col gap-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-action-primary">Primary Variant</span>
              <MotionButton variant="primary">Comando Principal</MotionButton>
              <p className="text-xs text-text-muted">Utilizado para ações de sovereignty, salvamento e criação.</p>
            </div>
            <div className="p-8 rounded-[32px] glass-l1 border-white/5 flex flex-col gap-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-action-secondary">Secondary Variant</span>
              <MotionButton variant="secondary">Comando de Suporte</MotionButton>
              <p className="text-xs text-text-muted">Utilizado para cancelamentos, resets e ações secundárias.</p>
            </div>
            <div className="p-8 rounded-[32px] glass-l1 border-white/5 flex flex-col gap-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Ghost Variant</span>
              <MotionButton variant="ghost">Navegação Sutil</MotionButton>
              <p className="text-xs text-text-muted">Utilizado em cabeçalhos, rodapés e ações de baixo impacto visual.</p>
            </div>
          </div>
        </section>

        {/* 2. Motion Lab: Interactive Physics */}
        <section className="mb-32">
          <header className="mb-12">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-action-primary" />
              02. Motion Lab (Física Háptica)
            </h2>
            <p className="text-text-muted mt-2 font-medium">O sistema deve ser sentido. Teste a física de mola que define a reatividades do Brand-Ops.</p>
          </header>
          <MotionSandbox />
        </section>

        {/* 3. Atomic Assets: Monogram & Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <section className="panel-shell p-10 glass-l1 border-white/5">
            <header className="mb-10">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Box className="h-5 w-5 text-action-primary" />
                Símbolos & Identidade
              </h3>
            </header>
            <div className="flex flex-wrap items-end gap-12">
              <div className="space-y-4 text-center">
                <BrandLogo size={80} variant="solid" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Solid Mark</div>
              </div>
              <div className="space-y-4 text-center">
                <BrandLogo size={80} variant="outline" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Outline Mark</div>
              </div>
              <div className="space-y-4 text-center p-6 bg-text rounded-3xl">
                <BrandLogo size={60} variant="glass" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Glass Overlay</div>
              </div>
            </div>
          </section>

          <section className="panel-shell p-10 glass-l1 border-white/5">
            <header className="mb-10">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Cpu className="h-5 w-5 text-action-primary" />
                Gamificação (BHI)
              </h3>
            </header>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-6">
                <BrandHealth score={42} size="md" label="Status: Vulnerável" />
                <BrandHealth score={85} size="md" label="Status: Dominante" />
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-action-primary">Impacto Estratégico</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  O BHI (Brand Health Index) visualiza a integridade da marca em tempo real. Pulsações lentas indicam estabilidade; rápidas, necessidade de ação.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 4. Strategic Emotion Tokens & Micro-copy */}
        <section className="mb-32">
          <header className="mb-12 text-center">
            <h2 className="text-2xl font-display font-bold">03. Emoção Estratégica & Voz</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Precision', 
                token: 'precision-focus', 
                desc: 'Foco cirúrgico em ativos críticos. Contraste elevado.',
                usage: 'Alertas, Status, KPIs'
              },
              { 
                name: 'Flow', 
                token: 'flow-state', 
                desc: 'Continuidade orgânica entre telas. Transições suaves.',
                usage: 'Navegação, Dashboards'
              },
              { 
                name: 'Clarity', 
                token: 'clarity-radical', 
                desc: 'Remoção Total de ruído operacional. Vidro 3D.',
                usage: 'Biblioteca, Filtros'
              }
            ].map(token => (
              <div key={token.name} className={`p-10 rounded-[32px] glass-l1 border-white/5 flex flex-col items-center text-center ${token.token}`}>
                <div className="text-sm font-bold uppercase tracking-[0.4em] text-action-primary mb-4">{token.name}</div>
                <p className="text-sm text-text-muted mb-8 leading-relaxed">{token.desc}</p>
                <div className="mt-auto px-4 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-text-muted/40">
                  Usage: {token.usage}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="border-t border-border/20 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.4em] text-text-muted/40">
            <Terminal className="h-4 w-4" />
            <span>Design Ops Engine - Registered Protocol</span>
          </div>
          <div className="text-[10px] text-text-muted/30 font-medium">
            Propriedade Intelectual AIOX - Brand Ops 2026
          </div>
        </footer>
      </div>
    </div>
  )
}
