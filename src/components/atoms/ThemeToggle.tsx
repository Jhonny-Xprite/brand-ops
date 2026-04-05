import { MoonStar, SunMedium } from 'lucide-react'

import { useTheme } from '@/lib/theme/ThemeContext'

import { MotionButton } from './MotionButton'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <MotionButton
      type="button"
      variant="ghost"
      onClick={toggleTheme}
      className="flex items-center gap-2 border border-border/60 bg-surface-muted/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-text"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <SunMedium size={14} /> : <MoonStar size={14} />}
      {isDark ? 'Modo Claro' : 'Modo Escuro'}
    </MotionButton>
  )
}
