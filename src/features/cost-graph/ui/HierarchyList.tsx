/**
 * Mobile hierarchy list fallback — essential workflow without tiny canvas.
 * Location: src/features/cost-graph/ui/HierarchyList.tsx
 */
import type { DomainModel, EvaluationResult } from '@/core/model'

type Props = {
  model: DomainModel
  evaluation: EvaluationResult
  selectedNodeId: string | null
  onSelect: (nodeId: string) => void
}

export function HierarchyList({ model, evaluation, selectedNodeId, onSelect }: Props) {
  return (
    <ul className="divide-y divide-[color:var(--line-default)] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] md:hidden">
      {evaluation.order.map((nodeId) => {
        const node = model.nodes.find((n) => n.id === nodeId)
        const result = evaluation.results[nodeId]
        if (!node) return null
        const value =
          result?.value.status === 'ok'
            ? `${result.value.perUnit.toFixed(2)} / Stk`
            : result?.value.status === 'unresolved'
              ? 'Unvollständig'
              : '—'
        const selected = selectedNodeId === nodeId
        return (
          <li key={nodeId}>
            <button
              type="button"
              className={`flex w-full flex-col items-start gap-1 px-4 py-3 text-left ${
                selected ? 'bg-[color:var(--accent-analysis)]/10' : ''
              }`}
              onClick={() => onSelect(nodeId)}
            >
              <span className="text-xs uppercase text-[color:var(--ink-muted)]">{node.kind}</span>
              <span className="font-medium">{node.label}</span>
              <span className="font-variant-numeric tabular-nums text-sm">{value}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
