/**
 * ELK automatic layout — sizes follow view type / collapse state.
 * Location: src/features/cost-graph/application/layout-with-elk.ts
 */
import ELK from 'elkjs/lib/elk.bundled.js'
import type { Edge, Node } from '@xyflow/react'
import type { FlowNodeData } from './map-domain-to-flow'
import { elkSizeForViewType } from './view-node-type'

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
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.nodeNodeBetweenLayers': '56',
    },
    children: nodes.map((node) => {
      const base = elkSizeForViewType(node.data.viewType, node.data.collapsed)
      const height =
        node.data.expanded &&
        (node.data.viewType === 'costCalculator' || node.data.viewType === 'funnel')
          ? Math.max(base.height, 56 + node.data.schemaFields.length * 52 + 48)
          : base.height
      return {
        id: node.id,
        width: node.data.expanded ? Math.max(base.width, 260) : base.width,
        height,
      }
    }),
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
