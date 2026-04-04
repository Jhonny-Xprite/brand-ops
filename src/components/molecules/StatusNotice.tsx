import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type StatusNoticeTone = 'error' | 'success' | 'warning' | 'info' | 'neutral'

export interface StatusNoticeProps {
  title: string
  message: ReactNode
  tone?: StatusNoticeTone
  role?: 'status' | 'alert'
  live?: 'off' | 'polite' | 'assertive'
  aside?: ReactNode
  className?: string
}

const getToneClassName = (tone: StatusNoticeTone) => {
  switch (tone) {
    case 'error':
      return 'border-status-error/30 bg-status-error/10 text-status-error'
    case 'success':
      return 'border-status-success/30 bg-status-success/10 text-status-success'
    case 'warning':
      return 'border-status-warning/30 bg-status-warning/10 text-status-warning'
    case 'info':
      return 'border-status-info/30 bg-status-info/10 text-status-info'
    case 'neutral':
    default:
      return 'border-border bg-surface text-text-muted'
  }
}

export const StatusNotice = ({
  title,
  message,
  tone = 'info',
  role = 'status',
  live = 'polite',
  aside,
  className = '',
}: StatusNoticeProps) => {
  const containerClassName = `rounded-xl border px-5 py-4 text-sm ${getToneClassName(tone)} ${className}`.trim()

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className={containerClassName}
      role={role}
      aria-live={live}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-semibold text-text">{title}</p>
          <div className="mt-1">{message}</div>
        </div>
        {aside ? <div className="flex flex-wrap gap-3">{aside}</div> : null}
      </div>
    </motion.section>
  )
}

export default StatusNotice
