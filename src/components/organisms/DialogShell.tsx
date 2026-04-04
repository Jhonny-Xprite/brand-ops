import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { MotionButton } from '@/components/atoms'

export interface DialogShellProps {
  eyebrow: string
  title: string
  titleId: string
  children: ReactNode
  actions?: ReactNode
  onClose: () => void
  closeLabel?: string
}

export const DialogShell = ({
  eyebrow,
  title,
  titleId,
  children,
  actions,
  onClose,
  closeLabel = 'Close',
}: DialogShellProps) => {
  return (
    <AnimatePresence>
      <div className="dialog-overlay" role="presentation">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="dialog-card relative z-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="dialog-header">
            <div>
              <p className="eyebrow-label tracking-[0.25em]">{eyebrow}</p>
              <h2 id={titleId} className="mt-2 text-xl font-display font-bold text-text">
                {title}
              </h2>
            </div>
            <MotionButton
              variant="ghost"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
            >
              {closeLabel}
            </MotionButton>
          </div>

          <div className="py-2">
            {children}
          </div>

          {actions ? <div className="dialog-actions">{actions}</div> : null}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DialogShell
