/**
 * Maps domain graph → React Flow objects (visualization only, not SoR).
 * Location: src/features/cost-graph/application/map-domain-to-flow.ts
 */
import type { Edge, Node } from '@xyflow/react'
import type { DomainModel, EvaluationResult, NodeId } from '@/core/model'

export type FlowNodeData = {
  domainNodeId: NodeId
  label: string
  kind: string
  displayValue: string
  unresolved: boolean
  allocationRule: string
}

export function mapDomainToFlow(
  model: DomainModel,
  evaluation: EvaluationResult,
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const nodes: Node<FlowNodeData>[] = model.nodes.map((node) => {
    const result = evaluation.results[node.id]
    let displayValue = '—'
    let unresolved = false
    if (!result || result.value.status === 'unresolved') {
      unresolved = true
      displayValue = result?.value.status === 'unresolved' ? 'Unvollständig' : '—'
    } else {
      displayValue = `${result.value.perUnit.toFixed(2)} / Stk`
    }
    return {
      id: node.id,
      type: 'marginNode',
      position: { x: 0, y: 0 },
      data: {
        domainNodeId: node.id,
        label: node.label,
        kind: node.kind,
        displayValue,
        unresolved,
        allocationRule: result?.provenance.allocationRule ?? 'none',
      },
    }
  })

  const edges: Edge[] = model.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: 'smoothstep',
  }))

  return { nodes, edges }
}
