/**
 * Compact cost/funnel row — expand-to-edit, enable/disable, remove.
 * Location: src/features/cost-graph/ui/CostPositionRow.tsx
 */
import type { WorkbenchCostRow } from '../application/project-workbench-view'

type Props = {
  row: WorkbenchCostRow
  expanded: boolean
  onToggle: () => void
  onInputChange: (fieldId: string, value: number) => void
  onSetEnabled: (enabled: boolean) => void
  onRemove: () => void
}

function formatMoney(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(2)} €`
}

export function CostPositionRow({
  row,
  expanded,
  onToggle,
  onInputChange,
  onSetEnabled,
  onRemove,
}: Props) {
  const amountLabel = !row.enabled
    ? formatMoney(0)
    : row.unresolved
      ? '—'
      : formatMoney(row.perUnit)

  return (
    <div
      className={`rounded-[10px] border border-[color:var(--line-default)] bg-white p-2 shadow-[0_1px_0_rgba(23,32,51,0.04)] ${
        row.enabled ? '' : 'opacity-60'
      }`}
      data-testid={`cost-row-${row.label}`}
      data-expanded={expanded ? 'true' : 'false'}
      data-enabled={row.enabled ? 'true' : 'false'}
      data-funnel={row.isFunnel ? 'true' : 'false'}
    >
      {/* Row 1: controls + label + amount — CSS grid so nothing can overlap */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-1">
        <label
          className="col-start-1 row-start-1 flex h-5 w-5 items-center justify-center"
          title={row.enabled ? 'Deaktivieren' : 'Aktivieren'}
        >
          <input
            type="checkbox"
            className="h-3.5 w-3.5 shrink-0 rounded border-[color:var(--line-default)]"
            checked={row.enabled}
            aria-label={`${row.label} aktiv`}
            onChange={(e) => onSetEnabled(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </label>

        <button
          type="button"
          className="col-start-2 row-start-1 min-w-0 text-left"
          onClick={onToggle}
          aria-expanded={expanded}
          disabled={!row.enabled && !expanded}
        >
          <span
            className={`block break-words text-[13px] font-medium leading-snug ${
              row.enabled
                ? 'text-[color:var(--ink-primary)]'
                : 'text-[color:var(--ink-muted)] line-through'
            }`}
          >
            {row.label}
          </span>
          <span className="mt-0.5 flex flex-wrap gap-1">
            {!row.enabled ? (
              <span className="rounded bg-[color:var(--surface-rail)] px-1 py-px text-[10px] font-medium text-[color:var(--ink-muted)]">
                Aus
              </span>
            ) : null}
            {row.allocationRule === 'allocated' ? (
              <span className="rounded bg-[color:var(--surface-rail)] px-1 py-px text-[10px] font-medium text-[color:var(--ink-muted)]">
                Allokation
              </span>
            ) : null}
            {row.isFunnel ? (
              <span className="rounded bg-[#e8eefc] px-1 py-px text-[10px] font-medium text-[color:var(--accent-analysis)]">
                Funnel
              </span>
            ) : null}
          </span>
        </button>

        <p
          className={`col-start-3 row-start-1 max-w-[4.75rem] pt-0.5 text-right font-variant-numeric text-[13px] font-semibold leading-snug tabular-nums ${
            row.unresolved && row.enabled
              ? 'text-[color:var(--semantic-warning)]'
              : 'text-[color:var(--ink-primary)]'
          }`}
          title={row.unresolved && row.enabled ? 'Unvollständig' : undefined}
        >
          {row.unresolved && row.enabled ? '…' : amountLabel}
        </p>

        {row.canRemove ? (
          <button
            type="button"
            className="col-start-4 row-start-1 flex h-5 w-5 items-center justify-center rounded text-base leading-none text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-rail)] hover:text-[color:var(--semantic-cost)]"
            aria-label={`${row.label} entfernen`}
            title="Entfernen"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            ×
          </button>
        ) : (
          <span className="col-start-4 row-start-1 h-5 w-5" aria-hidden />
        )}

        {!expanded && row.enabled ? (
          <p className="col-span-full col-start-2 break-words pr-6 text-[11px] leading-snug text-[color:var(--ink-muted)]">
            {row.unresolved ? (row.unresolvedMessage ?? 'Unvollständig') : row.derivationDe}
          </p>
        ) : null}
      </div>

      {expanded && row.enabled ? (
        <div className="mt-2 flex flex-col gap-2 border-t border-[color:var(--line-default)] pt-2">
          {row.schemaFields.map((field) => {
            if (field.id === 'revenuePerUnit') return null
            const raw = row.inputs[field.id]
            return (
              <label key={field.id} className="flex min-w-0 flex-col gap-0.5 text-xs">
                <span className="break-words text-[color:var(--ink-muted)]">
                  {field.labelDe}{' '}
                  <span className="tabular-nums">({field.unitDe})</span>
                </span>
                <input
                  className="w-full min-w-0 rounded border border-[color:var(--line-default)] bg-white px-2 py-1.5 font-variant-numeric tabular-nums"
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
          <p className="break-words text-xs text-[color:var(--ink-muted)]">{row.derivationDe}</p>
          <p className="font-variant-numeric text-sm font-semibold tabular-nums">
            = {row.unresolved ? 'Unvollständig' : formatMoney(row.perUnit)} / Auftrag
          </p>
        </div>
      ) : null}
    </div>
  )
}
