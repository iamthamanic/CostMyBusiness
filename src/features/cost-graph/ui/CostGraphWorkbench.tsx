/**
 * Cost graph workbench: KPI strip, desktop React Flow, mobile list, inspector.
 * Location: src/features/cost-graph/ui/CostGraphWorkbench.tsx
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { evaluate } from '@/core/calculation'
import type { DomainModel } from '@/core/model'
import { Button } from '@/shared/ui'
import { layoutWithElk } from '../application/layout-with-elk'
import { mapDomainToFlow, type FlowNodeData } from '../application/map-domain-to-flow'
import { addCostNode } from '../application/mutate-model'
import { HierarchyList } from './HierarchyList'
import { InspectorPanel } from './InspectorPanel'
import { MarginNode } from './MarginNode'

const nodeTypes = { marginNode: MarginNode } as NodeTypes

type Props = {
  model: DomainModel
  onModelChange: (next: DomainModel) => void
}

function WorkbenchInner({ model, onModelChange }: Props) {
  const evaluation = useMemo(() => evaluate(model), [model])
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('n-contribution')
  const [layoutError, setLayoutError] = useState<string | null>(null)

  const mapped = useMemo(() => mapDomainToFlow(model, evaluation), [model, evaluation])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const layouted = await layoutWithElk(mapped.nodes, mapped.edges)
        if (!cancelled) {
          setNodes(layouted)
          setLayoutError(null)
        }
      } catch {
        if (!cancelled) {
          setNodes(mapped.nodes)
          setLayoutError('Automatisches Layout nicht verfügbar — Fallback-Positionen.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mapped])

  const revenue = evaluation.results['n-revenue']
  const contribution = evaluation.results['n-contribution']

  const costPeriod = Object.values(evaluation.results)
    .filter((r) => {
      const node = model.nodes.find((n) => n.id === r.nodeId)
      return node?.kind === 'cost' && r.value.status === 'ok'
    })
    .reduce((sum, r) => sum + (r.value.status === 'ok' ? r.value.periodTotal : 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4 sm:grid-cols-3">
          <Kpi
            label="Umsatz"
            value={
              revenue?.value.status === 'ok'
                ? `${revenue.value.periodTotal.toFixed(2)}`
                : 'Unvollständig'
            }
          />
          <Kpi label="Kosten (aktiv)" value={costPeriod.toFixed(2)} />
          <Kpi
            label="Deckungsbeitrag"
            value={
              contribution?.value.status === 'ok'
                ? `${contribution.value.periodTotal.toFixed(2)}`
                : 'Unvollständig'
            }
          />
        </div>
        <Button
          onClick={() => {
            const next = addCostNode(model)
            onModelChange(next)
            const added = next.nodes[next.nodes.length - 1]
            if (added) setSelectedNodeId(added.id)
          }}
        >
          Kostenposition hinzufügen
        </Button>
      </div>

      {layoutError ? (
        <p className="text-sm text-[color:var(--semantic-warning)]" role="status">
          {layoutError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="hidden h-[480px] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] md:block">
          <ReactFlow
            nodes={nodes}
            edges={mapped.edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <HierarchyList
          model={model}
          evaluation={evaluation}
          selectedNodeId={selectedNodeId}
          onSelect={setSelectedNodeId}
        />

        <InspectorPanel
          model={model}
          selectedNodeId={selectedNodeId}
          results={evaluation.results}
          onModelChange={onModelChange}
          onSelectNode={setSelectedNodeId}
        />
      </div>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">{label}</p>
      <p className="font-variant-numeric text-xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function CostGraphWorkbench({ model, onModelChange }: Props) {
  return (
    <ReactFlowProvider>
      <WorkbenchInner model={model} onModelChange={onModelChange} />
    </ReactFlowProvider>
  )
}
