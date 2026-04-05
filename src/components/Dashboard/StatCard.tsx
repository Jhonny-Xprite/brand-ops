import { AppIcon } from '@/components/atoms'

interface StatCardProps {
  label: string
  value: string
  helper: string
  iconName?: 'dashboard' | 'media' | 'production' | 'overview'
}

export const StatCard = ({ label, value, helper, iconName = 'dashboard' }: StatCardProps) => (
  <article className="panel-shell p-6">
    <div className="flex items-center gap-3">
      <div className="empty-state-icon h-10 w-10 rounded-2xl border-action-primary/20 bg-action-primary/10 text-action-primary">
        <AppIcon name={iconName} size="sm" tone="active" decorative />
      </div>
      <p className="eyebrow-label text-action-primary/70">{label}</p>
    </div>
    <p className="mt-4 text-3xl font-display font-bold text-text">{value}</p>
    <p className="mt-3 text-sm leading-6 text-text-muted">{helper}</p>
  </article>
)

export default StatCard
