/**
 * Department column container for the product calculator workbench.
 * Location: src/features/cost-graph/ui/DepartmentColumn.tsx
 */
import type { WorkbenchDepartment } from '../application/project-workbench-view'
import { CostPositionRow } from './CostPositionRow'

const TONE: Record<
  WorkbenchDepartment['tone'],
  { bg: string; border: string; head: string }
> = {
  marketing: {
    bg: 'bg-[#eef4fb]',
    border: 'border-[#c5d6eb]',
    head: 'text-[#2a4a7a]',
  },
  sales: {
    bg: 'bg-[#eef8f3]',
    border: 'border-[#c5e0d4]',
    head: 'text-[#1f5c48]',
  },
  operations: {
    bg: 'bg-[#fbf5ec]',
    border: 'border-[#e6d4b8]',
    head: 'text-[#7a5528]',
  },
  support: {
    bg: 'bg-[#f4f0f8]',
    border: 'border-[#d6cae3]',
    head: 'text-[#5a3d7a]',
  },
  overhead: {
    bg: 'bg-[#faf0f0]',
    border: 'border-[#e4c8c8]',
    head: 'text-[#7a3a3a]',
  },
}

type Props = {
  department: WorkbenchDepartment
  collapsed: boolean
  expandedRowIds: Set<string>
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
  onToggleCollapse,
  onToggleRow,
  onInputChange,
  onAddCost,
}: Props) {
  const tone = TONE[department.tone]

  return (
    <section
      className={`flex min-w-[240px] flex-col rounded-[12px] border ${tone.border} ${tone.bg} p-3`}
      data-testid={`dept-${department.tone}`}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <header className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wide ${tone.head}`}>
              {department.label}
            </h3>
            <p className="mt-1 font-variant-numeric text-lg font-semibold tabular-nums text-[color:var(--ink-primary)]">
              {formatMoney(department.totalPerUnit)}
            </p>
            <p className="text-xs text-[color:var(--ink-muted)]">
              {department.shareOfNetPercent !== null
                ? `${department.shareOfNetPercent.toFixed(1)} % vom Nettoerlös`
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
        <div className="flex flex-1 flex-col gap-2">
          {department.rows.map((row) => (
            <CostPositionRow
              key={row.nodeId}
              row={row}
              expanded={expandedRowIds.has(row.nodeId)}
              onToggle={() => onToggleRow(row.nodeId)}
              onInputChange={(fieldId, value) => onInputChange(row.nodeId, fieldId, value)}
            />
          ))}
          <button
            type="button"
            className="mt-auto rounded-md border border-dashed border-[color:var(--line-default)] bg-white/70 px-2 py-1.5 text-xs text-[color:var(--ink-muted)] hover:border-[color:var(--accent-analysis)] hover:text-[color:var(--accent-analysis)]"
            onClick={onAddCost}
          >
            + Kostenposition
          </button>
        </div>
      ) : (
        <p className="text-xs text-[color:var(--ink-muted)]">
          {department.rows.length} Positionen · eingeklappt
        </p>
      )}
    </section>
  )
}
