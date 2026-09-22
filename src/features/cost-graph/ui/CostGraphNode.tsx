/**
 * Polymorphic Cost Graph node (department / cost / revenue / result).
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

  return (
    <div
      className={`min-w-[200px] rounded-[10px] border bg-[color:var(--surface-panel)] px-3 py-2 shadow-sm ${
        selected
          ? 'border-[color:var(--accent-analysis)]'
          : isResult
            ? 'border-[color:var(--ink-primary)]'
            : 'border-[color:var(--line-default)]'
      }`}
      data-view-type={data.viewType}
      data-collapsed={data.collapsed ? 'true' : 'false'}
    >
      <Handle type="target" position={Position.Top} className="!bg-[color:var(--line-default)]" />
      <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">
        {VIEW_LABEL[data.viewType]}
        {data.allocationRule === 'allocated' ? ' · alloziert' : ''}
        {data.allocationRule === 'direct' && data.viewType === 'costCalculator' ? ' · direkt' : ''}
      </p>
      <p className="font-medium text-[color:var(--ink-primary)]">{data.label}</p>
      <p
        className={`font-variant-numeric tabular-nums text-lg ${
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
        <p className="text-xs text-[color:var(--semantic-warning)]">Unvollständig</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-[color:var(--line-default)]" />
    </div>
  )
}

export const CostGraphNode = memo(CostGraphNodeComponent)
