import { useMemo, useState } from 'react'

import { MotionButton } from '@/components/atoms'

interface SocialAsset {
  id: string
  filename: string
  status: string
  updatedAt: string
  previewUrl?: string
}

/* eslint-disable no-unused-vars */
type MarkReadyHandler = (...args: [string]) => Promise<void>

interface SocialGridProps {
  items: SocialAsset[]
  onMarkReady: MarkReadyHandler
}

function classifyAspectRatio(width: number, height: number): string {
  if (!width || !height) {
    return 'Formato pendente'
  }

  const ratio = width / height

  if (Math.abs(ratio - 1) < 0.1) {
    return 'Instagram 1:1'
  }

  if (Math.abs(ratio - 9 / 16) < 0.1) {
    return 'Stories 9:16'
  }

  if (Math.abs(ratio - 1.91) < 0.2 || Math.abs(ratio - 16 / 9) < 0.2) {
    return 'LinkedIn 16:9'
  }

  return `${width}x${height}`
}

export const SocialGrid = ({ items, onMarkReady }: SocialGridProps) => {
  const [aspectRatioById, setAspectRatioById] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [items],
  )

  if (sortedItems.length === 0) {
    return (
      <div className="empty-state min-h-[280px] gap-3 px-6 py-10">
        <div className="empty-state-icon">SM</div>
        <p className="text-lg font-display font-bold text-text">Nenhum asset social pronto</p>
        <p className="max-w-md text-center text-text-muted">
          Assim que o projeto tiver imagens ou videos ligados ao fluxo social, eles aparecerao aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sortedItems.map((item) => (
        <article key={item.id} className="panel-shell overflow-hidden p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted">
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={item.filename}
                className="h-full w-full object-cover"
                onLoad={(event) => {
                  const target = event.currentTarget
                  setAspectRatioById((current) => ({
                    ...current,
                    [item.id]: classifyAspectRatio(target.naturalWidth, target.naturalHeight),
                  }))
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
                Asset sem preview
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-text">{item.filename}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-muted">
                  {aspectRatioById[item.id] ?? 'Lendo proporcao'}
                </p>
              </div>
              <span className="summary-pill border-border/60 bg-surface-muted/50 text-text-muted">
                {item.status}
              </span>
            </div>

            <MotionButton
              variant={item.status === 'Approved' || item.status === 'Done' ? 'secondary' : 'primary'}
              onClick={async () => {
                setSavingId(item.id)
                try {
                  await onMarkReady(item.id)
                } finally {
                  setSavingId(null)
                }
              }}
              disabled={savingId === item.id}
              className="w-full justify-center px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]"
            >
              {savingId === item.id
                ? 'Salvando...'
                : item.status === 'Approved' || item.status === 'Done'
                  ? 'Pronto para social'
                  : 'Marcar como pronto'}
            </MotionButton>
          </div>
        </article>
      ))}
    </div>
  )
}

export default SocialGrid
