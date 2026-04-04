/**
 * OfflineIndicator Component
 * Displays the current online/offline status with semantic design-system styles.
 */

import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/TranslationContext'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation()
  const { isOnline, isLoading } = useOnlineStatus()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) {
    return null
  }

  const badgeClassName = isOnline
    ? 'status-badge status-badge-success'
    : 'status-badge status-badge-error'

  return (
    <div
      className={badgeClassName}
      role="status"
      aria-live="polite"
      aria-label={`${t('status.online')}: ${isOnline ? t('status.online') : t('status.offline')}`}
    >
      {isOnline ? <Wifi aria-hidden="true" className="h-4 w-4" /> : <WifiOff aria-hidden="true" className="h-4 w-4" />}
      <span>{isOnline ? t('status.online') : t('status.offline')}</span>
    </div>
  )
}

export default OfflineIndicator
