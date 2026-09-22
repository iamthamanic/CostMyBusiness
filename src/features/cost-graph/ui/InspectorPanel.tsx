/**
 * Inspector drill-down: Result → Layer/Node → Drivers/Inputs → Formula.
 * Location: src/features/cost-graph/ui/InspectorPanel.tsx
 */
import type { DomainModel, NodeResult } from '@/core/model'

type Props = {
  model: DomainModel
  selectedNodeId: string | null
  results: Record<string, NodeResult>
}

export function InspectorPanel({ model, selectedNodeId, results }: Props) {
  if (!selectedNodeId) {
    return (
      <aside className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
        <h2 className="text-lg font-medium">Inspector</h2>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Wählen Sie einen Knoten, um die Herleitung zu sehen.
        </p>
      </aside>
    )
  }

  const node = model.nodes.find((n) => n.id === selectedNodeId)
  const result = results[selectedNodeId]
  if (!node) {
    return (
      <aside className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
        <p role="alert">Knoten nicht gefunden.</p>
      </aside>
    )
  }

  const upstream = model.edges
    .filter((e) => e.targetNodeId === selectedNodeId)
    .map((e) => model.nodes.find((n) => n.id === e.sourceNodeId))
    .filter(Boolean)

  return (
    <aside className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <h2 className="text-lg font-medium">Inspector</h2>
      <ol className="list-decimal space-y-2 pl-4 text-sm">
        <li>
          <span className="font-medium">Ergebnis / Schicht:</span> {node.label} ({node.kind})
        </li>
        <li>
          <span className="font-medium">Knoten:</span> {node.key}
        </li>
        <li>
          <span className="font-medium">Zuordnung:</span>{' '}
          {result?.provenance.allocationRule ?? 'none'}
          {result?.provenance.sourcePoolId
            ? ` · Pool ${result.provenance.sourcePoolId}`
            : ''}
        </li>
        <li>
          <span className="font-medium">Eingaben:</span>{' '}
          {Object.keys(node.inputs).length === 0
            ? 'keine'
            : Object.entries(node.inputs)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ')}
        </li>
        <li>
          <span className="font-medium">Formel:</span> {node.formulaRef ?? 'Standardberechnung'}
        </li>
        <li>
          <span className="font-medium">Zulieferer:</span>{' '}
          {upstream.length === 0
            ? '—'
            : upstream.map((n) => n?.label).join(' → ')}
        </li>
      </ol>
      {result?.value.status === 'unresolved' ? (
        <p className="text-sm text-[color:var(--semantic-warning)]" role="status">
          Unvollständig: {result.value.message}
        </p>
      ) : result?.value.status === 'ok' ? (
        <p className="font-variant-numeric text-sm tabular-nums">
          {result.value.perUnit.toFixed(2)} / Stk · {result.value.periodTotal.toFixed(2)} Periode
        </p>
      ) : null}
    </aside>
  )
}
