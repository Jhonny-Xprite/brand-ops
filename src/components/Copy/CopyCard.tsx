import { useState } from 'react'

import { MotionButton } from '@/components/atoms'

interface CopyCardProps {
  title: string
  content: string
  copyType: string
  angle: string
  audience: string
}

async function copyToClipboard(content: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = content
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export const CopyCard = ({ title, content, copyType, angle, audience }: CopyCardProps) => {
  const [copied, setCopied] = useState(false)

  return (
    <article className="panel-shell p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="summary-pill border-action-primary/20 bg-action-primary/10 text-action-primary">
          {copyType}
        </span>
        <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
          {angle}
        </span>
        <span className="summary-pill border-border/60 bg-surface-muted/40 text-text-muted">
          {audience}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-display font-bold text-text">{title}</h3>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text-muted">{content}</p>

      <div className="mt-6">
        <MotionButton
          variant="secondary"
          onClick={async () => {
            await copyToClipboard(content)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          }}
          className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]"
        >
          {copied ? 'Copiado!' : 'Copiar texto'}
        </MotionButton>
      </div>
    </article>
  )
}

export default CopyCard
