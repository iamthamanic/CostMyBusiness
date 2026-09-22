/**
 * Department column container for the product calculator workbench.
 * Location: src/features/cost-graph/ui/DepartmentColumn.tsx
 */
import type { WorkbenchDepartment } from '../application/project-workbench-view'
import { CostPositionRow } from './CostPositionRow'

const TONE: Record<
  WorkbenchDepartment['tone'],
  { bg: string; border: string; head: string; badge: string }
> = {
  marketing: {
    bg: 'bg-[#eef4fb]',
    border: 'border-[#c5d6eb]',
    head: 'text-[#2a4a7a]',
    badge: 'bg-[#d6e4f5] text-[#2a4a7a]',
  },
  sales: {
    bg: 'bg-[#eef8f3]',
    border: 'border-[#c5e0d4]',
    head: 'text-[#1f5c48]',
    badge: 'bg-[#d8eee4] text-[#1f5c48]',
  },
  operations: {
    bg: 'bg-[#fbf5ec]',
    border: 'border-[#e6d4b8]',
    head: 'text-[#7a5528]',
    badge: 'bg-[#f0e2cc] text-[#7a5528]',
  },
  support: {
    bg: 'bg-[#f4f0f8]',
    border: 'border-[#d6cae3]',
    head: 'text-[#5a3d7a]',
    badge: 'bg-[#e6dcf0] text-[#5a3d7a]',
  },
  overhead: {
    bg: 'bg-[#faf0f0]',
    border: 'border-[#e4c8c8]',
    head: 'text-[#7a3a3a]',
    badge: 'bg-[#f0dede] text-[#7a3a3a]',
  },
}

type Props = {
  department: WorkbenchDepartment
  collapsed: boolean
  expandedRowIds: Set<string>
  hideAllocated?: boolean
  onToggleCollapse: () => void
  onToggleRow: (nodeId: string) => void
  onInputChange: (nodeId: string, fieldId: string, value: number) => void
  onAddCost: () => void
}

function formatMoney(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(2)} €`
}

export function DepartmentColumn({
  department,
  collapsed,
  expandedRowIds,
  hideAllocated = false,
  onToggleCollapse,
  onToggleRow,
  onInputChange,
  onAddCost,
}: Props) {
  const tone = TONE[department.tone]
  const rows = hideAllocated
    ? department.rows.filter((r) => r.allocationRule !== 'allocated')
    : department.rows

  const displayTotal = hideAllocated
    ? rows.reduce((sum, r) => (r.perUnit !== null ? sum + r.perUnit : sum), 0)
    : department.totalPerUnit

  const share =
    hideAllocated && department.shareOfNetPercent !== null && department.totalPerUnit
      ? department.shareOfNetPercent
      : department.shareOfNetPercent

  return (
    <section
      className={`flex min-w-[220px] flex-col rounded-[14px] border ${tone.border} ${tone.bg} p-3`}
      data-testid={`dept-${department.tone}`}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <header className="mb-2.5 border-b border-black/5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${tone.head}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${tone.badge}`}
                aria-hidden
              >
                {department.label.slice(0, 1)}
              </span>
              {department.label}
            </h3>
            <p className="mt-1 font-variant-numeric text-xl font-semibold tabular-nums text-[color:var(--ink-primary)]">
              {formatMoney(
                hideAllocated
                  ? rows.every((r) => r.perUnit !== null)
                    ? displayTotal
                    : null
                  : department.totalPerUnit,
              )}
            </p>
            <p className="text-xs text-[color:var(--ink-muted)]">
              {share !== null && !hideAllocated
                ? `${share.toFixed(1)} % vom Nettoerlös`
                : hideAllocated && rows.length > 0
                  ? 'nur direkte Kosten'
                  : 'Anteil —'}
            </p>
          </div>
          <button
            type="button"
            className="rounded border border-[color:var(--line-default)] bg-white px-1.5 py-0.5 text-xs"
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        </div>
      </header>

      {!collapsed ? (
        <div className="flex flex-1 flex-col gap-1.5">
          {rows.map((row) => (
            <CostPositionRow
              key={row.nodeId}
              row={row}
              expanded={expandedRowIds.has(row.nodeId)}
              onToggle={() => onToggleRow(row.nodeId)}
              onInputChange={(fieldId, value) => onInputChange(row.nodeId, fieldId, value)}
            />
          ))}
          {rows.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)]">Keine direkten Positionen</p>
          ) : null}
          <button
            type="button"
            className="mt-auto rounded-md border border-dashed border-[color:var(--line-default)] bg-white/80 px-2 py-1.5 text-xs text-[color:var(--ink-muted)] hover:border-[color:var(--accent-analysis)] hover:text-[color:var(--accent-analysis)]"
            onClick={onAddCost}
          >
            + Kostenposition
          </button>
        </div>
      ) : (
        <p className="text-xs text-[color:var(--ink-muted)]">
          {rows.length} Positionen · eingeklappt
        </p>
      )}
    </section>
  )
}
