interface ProductionChartProps {
  items: Array<{
    date: string
    count: number
  }>
}

export const ProductionChart = ({ items }: ProductionChartProps) => {
  const maxCount = items.reduce((max, item) => Math.max(max, item.count), 0)

  if (items.length === 0) {
    return (
      <div className="empty-state min-h-[220px] gap-3 px-6 py-10">
        <div className="empty-state-icon">0</div>
        <p className="text-lg font-display font-bold text-text">Sem producao no periodo</p>
        <p className="max-w-sm text-center text-text-muted">
          Assim que ativos ligados ao projeto entrarem no fluxo, a linha do tempo aparecera aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const width = maxCount > 0 ? `${Math.max((item.count / maxCount) * 100, 8)}%` : '8%'
        return (
          <div key={item.date} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              <span>{item.date}</span>
              <span>{item.count} ativos</span>
            </div>
            <div className="h-3 rounded-full bg-surface-muted">
              <div
                className="h-3 rounded-full bg-action-primary transition-all duration-300"
                style={{ width }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductionChart
