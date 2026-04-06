import { AppIcon } from '@brand-ops/ui/atoms'

interface ActivityFeedProps {
  items: Array<{
    id: string
    message: string
    updatedAt: string
  }>
}

export const ActivityFeed = ({ items }: ActivityFeedProps) => {
  if (items.length === 0) {
    return (
      <div className="empty-state min-h-[220px] gap-3 px-6 py-10">
        <div className="empty-state-icon">
          <AppIcon name="info" size="md" tone="muted" decorative />
        </div>
        <p className="text-lg font-display font-bold text-text">Sem atividade recente</p>
        <p className="max-w-sm text-center text-text-muted">
          Quando arquivos ou entradas deste projeto forem atualizados, o feed aparecera aqui.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border/60 bg-surface-muted/30 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AppIcon name="info" size="sm" tone="active" decorative />
            </div>
            <div>
              <p className="text-sm font-medium leading-6 text-text">{item.message}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-muted">
                {new Date(item.updatedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ActivityFeed
