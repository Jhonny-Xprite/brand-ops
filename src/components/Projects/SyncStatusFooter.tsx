import React from 'react'
import { CheckCircle2, AlertCircle, RotateCw } from 'lucide-react'

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
          color: 'bg-green-50 text-green-700 border-green-200',
        }
      case 'syncing':
        return {
          icon: RotateCw,
          message: 'Sincronizando...',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          animate: true,
        }
      case 'failed':
        return {
          icon: AlertCircle,
          message: error || 'Erro na sincronização',
          color: 'bg-red-50 text-red-700 border-red-200',
        }
      default:
        return {
          icon: CheckCircle2,
          message: 'Status desconhecido',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
        }
    }
  }

  const { icon: Icon, message, color, animate } = getStatusInfo()

  return (
    <footer
      className={`border-t border-gray-200 ${color} px-6 py-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={animate ? 'animate-spin' : ''}
        />
        <span className="text-sm font-medium">{message}</span>
      </div>

      {syncStatus === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium hover:underline"
        >
          Tentar novamente
        </button>
      )}
    </footer>
  )
}

export default SyncStatusFooter
