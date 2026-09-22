/**
 * Compact cost/funnel row — collapsed summary + expand-to-edit.
 * Location: src/features/cost-graph/ui/CostPositionRow.tsx
 */
import type { WorkbenchCostRow } from '../application/project-workbench-view'

type Props = {
  row: WorkbenchCostRow
  expanded: boolean
  onToggle: () => void
  onInputChange: (fieldId: string, value: number) => void
}

function formatMoney(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(2)} €`
}

export function CostPositionRow({ row, expanded, onToggle, onInputChange }: Props) {
  return (
    <div
      className="rounded-md border border-[color:var(--line-default)] bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(23,32,51,0.04)]"
      data-testid={`cost-row-${row.label}`}
      data-expanded={expanded ? 'true' : 'false'}
      data-funnel={row.isFunnel ? 'true' : 'false'}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-1 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="flex w-full items-start justify-between gap-2">
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-[color:var(--ink-primary)]">
            {row.label}
            {row.allocationRule === 'allocated' ? (
              <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[color:var(--ink-muted)]">
                Allokation
              </span>
            ) : null}
            {row.isFunnel ? (
              <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[color:var(--accent-analysis)]">
                Funnel
              </span>
            ) : null}
          </span>
          <span
            className={`shrink-0 font-variant-numeric text-sm font-semibold tabular-nums ${
              row.unresolved
                ? 'text-[color:var(--semantic-warning)]'
                : 'text-[color:var(--ink-primary)]'
            }`}
          >
            {row.unresolved ? 'Unvollständig' : formatMoney(row.perUnit)}
          </span>
        </span>
        {!expanded ? (
          <span className="block text-xs leading-snug text-[color:var(--ink-muted)]">
            {row.unresolved ? (row.unresolvedMessage ?? 'Unvollständig') : row.derivationDe}
          </span>
        ) : null}
      </button>

      {expanded ? (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-[color:var(--line-default)] pt-2">
          {row.schemaFields.map((field) => {
            if (field.id === 'revenuePerUnit') return null
            const raw = row.inputs[field.id]
            return (
              <label key={field.id} className="flex flex-col gap-0.5 text-xs">
                <span className="text-[color:var(--ink-muted)]">
                  {field.labelDe}{' '}
                  <span className="tabular-nums">({field.unitDe})</span>
                </span>
                <input
                  className="rounded border border-[color:var(--line-default)] bg-white px-2 py-1 font-variant-numeric tabular-nums"
                  type="number"
                  step="any"
                  min={0}
                  value={raw === undefined ? '' : String(raw)}
                  aria-label={`${row.label} ${field.labelDe}`}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') return
                    const num = Number(v)
                    if (!Number.isFinite(num)) return
                    onInputChange(field.id, num)
                  }}
                />
              </label>
            )
          })}
          <p className="text-xs text-[color:var(--ink-muted)]">{row.derivationDe}</p>
          <p className="font-variant-numeric text-sm font-semibold tabular-nums">
            = {row.unresolved ? 'Unvollständig' : formatMoney(row.perUnit)} / Auftrag
          </p>
        </div>
      ) : null}
    </div>
  )
}
