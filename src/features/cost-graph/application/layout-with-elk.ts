/**
 * ELK automatic layout for React Flow nodes (positions only; domain remains SoR).
 * Location: src/features/cost-graph/application/layout-with-elk.ts
 */
import ELK from 'elkjs/lib/elk.bundled.js'
import type { Edge, Node } from '@xyflow/react'
import type { FlowNodeData } from './map-domain-to-flow'

const elk = new ELK()

export async function layoutWithElk(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
): Promise<Node<FlowNodeData>[]> {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '48',
      'elk.layered.spacing.nodeNodeBetweenLayers': '64',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 220,
      height: 88,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  }

  const layouted = await elk.layout(graph)
  const positions = new Map(
    (layouted.children ?? []).map((child) => [child.id, { x: child.x ?? 0, y: child.y ?? 0 }]),
  )

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }))
}
