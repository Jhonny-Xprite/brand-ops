import React from 'react'
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react'
import { MotionButton } from '@/components/atoms'

interface SyncStatusFooterProps {
  syncStatus: 'synced' | 'syncing' | 'failed'
  error?: string | null
  onRetry?: () => void
}

export const SyncStatusFooter: React.FC<SyncStatusFooterProps> = ({
  syncStatus,
  error,
  onRetry,
}) => {
  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: CheckCircle2,
          message: 'Tudo sincronizado',
          toneClassName: 'border-status-success/30 bg-status-success/10 text-status-success',
        }
      case 'syncing':
        return {
          icon: RotateCw,
          message: 'Sincronizando operacoes...',
          toneClassName: 'border-status-info/30 bg-status-info/10 text-status-info',
          animate: true,
        }
      case 'failed':
        return {
          icon: AlertCircle,
          message: error || 'Erro na sincronizacao',
          toneClassName: 'border-status-error/30 bg-status-error/10 text-status-error',
        }
      default:
        return {
          icon: CheckCircle2,
          message: 'Status desconhecido',
          toneClassName: 'border-border bg-surface text-text-muted',
        }
    }
  }

  const { icon: Icon, message, toneClassName, animate } = getStatusInfo()

  return (
    <footer className="border-t border-border/50 bg-surface/80 px-6 py-4 backdrop-blur-xl">
      <div className={`mx-auto flex max-w-7xl flex-col gap-4 rounded-2xl border px-5 py-4 md:flex-row md:items-center md:justify-between ${toneClassName}`}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={animate ? 'animate-spin' : ''} />
          <span className="text-sm font-semibold">{message}</span>
        </div>

        {syncStatus === 'failed' && onRetry ? (
          <MotionButton
            variant="secondary"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
          >
            Tentar novamente
          </MotionButton>
        ) : null}
      </div>
    </footer>
  )
}

export default SyncStatusFooter
