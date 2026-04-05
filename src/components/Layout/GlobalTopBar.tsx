import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeftRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearProjectContext } from '@/store/projects/projects.slice'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { BrandSignature, MotionButton } from '@/components/atoms'

export interface GlobalTopBarProps {
  projectName?: string
}

/**
 * GlobalTopBar Component
 * Displays the active project and "Trocar Projeto" button for context switching
 * AC#1: TopBar Global - Deve exibir [Logo BO] + Nome do Projeto Ativo e um botao claro de "Trocar Projeto"
 */
export const GlobalTopBar = ({ projectName }: GlobalTopBarProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { activeProjectId } = useAppSelector((state) => state.projects)
  const { t } = useTranslation()

  const handleSwitchProject = useCallback(async () => {
    await dispatch(clearProjectContext())
    await router.push('/')
  }, [dispatch, router])

  return (
    <header className="border-b border-border/60 bg-surface/90 px-6 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-text transition hover:text-action-primary">
            <BrandSignature size={42} compact />
          </Link>
          {activeProjectId && projectName ? (
            <div className="hidden rounded-2xl border border-border/60 bg-surface-muted/60 px-4 py-3 md:block">
              <p className="eyebrow-label text-action-primary/60">{t('navigation.projeto_ativo')}</p>
              <p className="mt-2 text-base font-semibold text-text">{projectName}</p>
            </div>
          ) : null}
        </div>

        {activeProjectId ? (
          <MotionButton
            variant="ghost"
            onClick={() => void handleSwitchProject()}
            className="flex items-center gap-2 border border-border/60 bg-surface-muted/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-text"
          >
            <ArrowLeftRight size={14} />
            {t('navigation.trocar_projeto')}
          </MotionButton>
        ) : null}
      </div>
    </header>
  )
}

export default GlobalTopBar
