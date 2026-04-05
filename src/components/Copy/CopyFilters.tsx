/* eslint-disable no-unused-vars */
type StringChangeHandler = (...args: [string]) => void

interface CopyFiltersProps {
  angle: string
  audience: string
  onAngleChange: StringChangeHandler
  onAudienceChange: StringChangeHandler
}

export const CopyFilters = ({
  angle,
  audience,
  onAngleChange,
  onAudienceChange,
}: CopyFiltersProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <label className="flex flex-col gap-2">
      <span className="field-label mb-0">Angulo</span>
      <select value={angle} onChange={(event) => onAngleChange(event.target.value)} className="select-field">
        <option value="">Todos</option>
        <option value="geral">Geral</option>
        <option value="autoridade">Autoridade</option>
        <option value="prova">Prova</option>
        <option value="urgencia">Urgencia</option>
      </select>
    </label>
    <label className="flex flex-col gap-2">
      <span className="field-label mb-0">Publico</span>
      <select value={audience} onChange={(event) => onAudienceChange(event.target.value)} className="select-field">
        <option value="">Todos</option>
        <option value="todos">Todos</option>
        <option value="leads-frios">Leads frios</option>
        <option value="leads-quentes">Leads quentes</option>
        <option value="clientes">Clientes</option>
      </select>
    </label>
  </div>
)

export default CopyFilters
