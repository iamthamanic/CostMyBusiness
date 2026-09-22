/**
 * Polymorphic Cost Graph node with optional inline cost inputs.
 * Location: src/features/cost-graph/ui/CostGraphNode.tsx
 */
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNodeData } from '../application/map-domain-to-flow'

const VIEW_LABEL: Record<FlowNodeData['viewType'], string> = {
  productPrice: 'Preis',
  revenue: 'Umsatz',
  department: 'Department',
  costCalculator: 'Kosten',
  funnel: 'Funnel',
  result: 'Ergebnis',
}

function CostGraphNodeComponent({ data, selected }: NodeProps & { data: FlowNodeData }) {
  const isDept = data.viewType === 'department'
  const isResult = data.viewType === 'result'
  const showInline =
    (data.viewType === 'costCalculator' || data.viewType === 'funnel') &&
    data.expanded &&
    data.onInputChange

  return (
    <div
      className={`min-w-[200px] max-w-[280px] rounded-[10px] border bg-[color:var(--surface-panel)] px-3 py-2 shadow-sm ${
        selected
          ? 'border-[color:var(--accent-analysis)]'
          : isResult
            ? 'border-[color:var(--ink-primary)]'
            : 'border-[color:var(--line-default)]'
      }`}
      data-view-type={data.viewType}
      data-collapsed={data.collapsed ? 'true' : 'false'}
      data-expanded={data.expanded ? 'true' : 'false'}
    >
      <Handle type="target" position={Position.Top} className="!bg-[color:var(--line-default)]" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">
            {VIEW_LABEL[data.viewType]}
            {data.allocationRule === 'allocated' ? ' · alloziert' : ''}
            {data.allocationRule === 'direct' && data.viewType === 'costCalculator'
              ? ' · direkt'
              : ''}
          </p>
          <p className="font-medium text-[color:var(--ink-primary)]">{data.label}</p>
        </div>
        {data.onToggleExpand ? (
          <button
            type="button"
            className="nodrag nopan rounded border border-[color:var(--line-default)] px-1.5 py-0.5 text-xs"
            aria-expanded={data.expanded}
            onClick={(e) => {
              e.stopPropagation()
              data.onToggleExpand?.()
            }}
          >
            {data.expanded ? '−' : '+'}
          </button>
        ) : null}
      </div>

      {showInline ? (
        <div className="nodrag nopan mt-2 flex flex-col gap-1.5">
          {data.schemaFields.map((field) => {
            const raw = data.inputs[field.id]
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
                  aria-required={field.required}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') return
                    const num = Number(v)
                    if (!Number.isFinite(num)) return
                    data.onInputChange?.(field.id, num)
                  }}
                />
              </label>
            )
          })}
          <p className="mt-1 border-t border-[color:var(--line-default)] pt-1 text-xs text-[color:var(--ink-muted)]">
            {data.derivationDe}
          </p>
        </div>
      ) : null}

      <p
        className={`mt-1 font-variant-numeric tabular-nums text-lg ${
          data.unresolved
            ? 'text-[color:var(--semantic-warning)]'
            : 'text-[color:var(--ink-primary)]'
        }`}
      >
        {data.displayValue}
      </p>
      {isDept ? (
        <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
          {data.emptyDepartment
            ? 'Keine Positionen — Vorlage ergänzen oder Kosten hinzufügen'
            : data.collapsed
              ? `${data.childCount} Positionen · eingeklappt`
              : `${data.childCount} Positionen`}
        </p>
      ) : null}
      {data.unresolved ? (
        <p className="text-xs text-[color:var(--semantic-warning)]" role="status">
          {data.unresolvedMessage ?? 'Unvollständig'}
        </p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-[color:var(--line-default)]" />
    </div>
  )
}

export const CostGraphNode = memo(CostGraphNodeComponent)
