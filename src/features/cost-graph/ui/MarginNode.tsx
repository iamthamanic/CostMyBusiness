/**
 * Custom Margin Spine node for React Flow.
 * Location: src/features/cost-graph/ui/MarginNode.tsx
 */
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNodeData } from '../application/map-domain-to-flow'

function MarginNodeComponent({ data, selected }: NodeProps & { data: FlowNodeData }) {
  return (
    <div
      className={`min-w-[200px] rounded-[10px] border bg-[color:var(--surface-panel)] px-3 py-2 shadow-sm ${
        selected
          ? 'border-[color:var(--accent-analysis)]'
          : 'border-[color:var(--line-default)]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[color:var(--line-default)]" />
      <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">{data.kind}</p>
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
      {data.unresolved ? (
        <p className="text-xs text-[color:var(--semantic-warning)]">Warnung: unvollständig</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-[color:var(--line-default)]" />
    </div>
  )
}

export const MarginNode = memo(MarginNodeComponent)
