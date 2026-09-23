/**
 * Department column container for the product calculator workbench.
 * Location: src/features/cost-graph/ui/DepartmentColumn.tsx
 */
import { useEffect, useRef, useState } from 'react'
import type { MarketingCampaign, MarketingFunnel, ProductFunnel } from '@/features/funnels'
import type { WorkbenchDepartment } from '../application/project-workbench-view'
import { CostPositionRow } from './CostPositionRow'
import { MarketingFunnelCard } from './MarketingFunnelCard'

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
  funnels?: ProductFunnel[]
  onToggleCollapse: () => void
  onToggleRow: (nodeId: string) => void
  onInputChange: (nodeId: string, fieldId: string, value: number) => void
  onSetEnabled: (nodeId: string, enabled: boolean) => void
  onRemove: (nodeId: string) => void
  onAddCost: () => void
  onAddFunnel?: () => void
  onCampaignsChange?: (funnelId: string, campaigns: MarketingCampaign[]) => void
  onRenameFunnel?: (funnelId: string, name: string) => void
}

function formatMoney(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(2)} €`
}

function funnelIdFromRow(nodeId: string): string {
  return nodeId.replace(/^n_funnel_/, '')
}

export function DepartmentColumn({
  department,
  collapsed,
  expandedRowIds,
  hideAllocated = false,
  funnels = [],
  onToggleCollapse,
  onToggleRow,
  onInputChange,
  onSetEnabled,
  onRemove,
  onAddCost,
  onAddFunnel,
  onCampaignsChange,
  onRenameFunnel,
}: Props) {
  const tone = TONE[department.tone]
  // Hide disabled template channel costs once promoted to funnels
  const rows = (hideAllocated
    ? department.rows.filter((r) => r.allocationRule !== 'allocated')
    : department.rows
  ).filter((r) => !(department.tone === 'marketing' && !r.isFunnel && !r.enabled))
  const canAddFunnel =
    (department.tone === 'marketing' || department.tone === 'sales') && Boolean(onAddFunnel)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addMenuOpen) return
    function onDoc(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [addMenuOpen])

  const displayTotal = hideAllocated
    ? rows.reduce(
        (sum, r) => (r.enabled && r.perUnit !== null ? sum + r.perUnit : sum),
        0,
      )
    : department.totalPerUnit

  const share =
    hideAllocated && department.shareOfNetPercent !== null && department.totalPerUnit
      ? department.shareOfNetPercent
      : department.shareOfNetPercent

  return (
    <section
      className={`flex min-w-0 flex-col rounded-[14px] border ${tone.border} ${tone.bg} p-3`}
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
          {rows.map((row) => {
            if (row.isFunnel) {
              const fid = funnelIdFromRow(row.nodeId)
              const funnel = funnels.find((f) => f.id === fid)
              if (funnel?.type === 'marketing') {
                return (
                  <MarketingFunnelCard
                    key={row.nodeId}
                    funnel={funnel as MarketingFunnel}
                    row={row}
                    expanded={expandedRowIds.has(row.nodeId)}
                    onToggle={() => onToggleRow(row.nodeId)}
                    onSetEnabled={(enabled) => onSetEnabled(row.nodeId, enabled)}
                    onDeleteFunnel={() => onRemove(row.nodeId)}
                    onRename={(name) => onRenameFunnel?.(fid, name)}
                    onCampaignsChange={(campaigns) => onCampaignsChange?.(fid, campaigns)}
                  />
                )
              }
            }
            return (
              <CostPositionRow
                key={row.nodeId}
                row={row}
                expanded={expandedRowIds.has(row.nodeId)}
                onToggle={() => onToggleRow(row.nodeId)}
                onInputChange={(fieldId, value) => onInputChange(row.nodeId, fieldId, value)}
                onSetEnabled={(enabled) => onSetEnabled(row.nodeId, enabled)}
                onRemove={() => onRemove(row.nodeId)}
              />
            )
          })}
          {rows.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-muted)]">Keine Positionen</p>
          ) : null}
          <div className="relative mt-auto" ref={addMenuRef}>
            <button
              type="button"
              className="w-full rounded-md border border-dashed border-[color:var(--line-default)] bg-white/80 px-2 py-1.5 text-xs text-[color:var(--ink-muted)] hover:border-[color:var(--accent-analysis)] hover:text-[color:var(--accent-analysis)]"
              data-testid={`add-position-${department.tone}`}
              aria-haspopup={canAddFunnel ? 'menu' : undefined}
              aria-expanded={canAddFunnel ? addMenuOpen : undefined}
              onClick={() => {
                if (canAddFunnel) setAddMenuOpen((o) => !o)
                else onAddCost()
              }}
            >
              + Position hinzufügen
            </button>
            {canAddFunnel && addMenuOpen ? (
              <div
                role="menu"
                className="absolute bottom-full left-0 z-30 mb-1 w-full rounded-[8px] border border-[color:var(--line-default)] bg-white py-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--surface-rail)]"
                  onClick={() => {
                    setAddMenuOpen(false)
                    onAddCost()
                  }}
                >
                  Kostenposition
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--surface-rail)]"
                  data-testid={`add-funnel-${department.tone}`}
                  onClick={() => {
                    setAddMenuOpen(false)
                    onAddFunnel?.()
                  }}
                >
                  Funnel
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[color:var(--ink-muted)]">
          {rows.length} Positionen · eingeklappt
        </p>
      )}
    </section>
  )
}
