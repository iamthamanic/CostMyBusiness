/**
 * Maps domain graph → React Flow objects (visualization only, not SoR).
 * Location: src/features/cost-graph/application/map-domain-to-flow.ts
 */
import type { Edge, Node } from '@xyflow/react'
import type { DomainModel, EvaluationResult, NodeId } from '@/core/model'
import { resolveViewType, type CostGraphViewType } from './view-node-type'

export type FlowNodeData = {
  domainNodeId: NodeId
  label: string
  kind: string
  viewType: CostGraphViewType
  displayValue: string
  unresolved: boolean
  allocationRule: string
  childCount: number
  collapsed: boolean
  emptyDepartment: boolean
}

export type MapDomainToFlowOptions = {
  /** Collapsed department (group) node ids — children omitted from view. */
  collapsedDepartmentIds?: Set<string>
  /** contribution = direct costs only in KPI path; fullyLoaded includes allocated. */
  costView?: 'contribution' | 'fullyLoaded'
}

function isAllocatedCost(
  model: DomainModel,
  nodeId: string,
  evaluation: EvaluationResult,
): boolean {
  const node = model.nodes.find((n) => n.id === nodeId)
  if (!node || node.kind !== 'cost') return false
  const rule = evaluation.results[nodeId]?.provenance.allocationRule
  return rule === 'allocated' || node.allocation?.rule === 'allocated'
}

export function mapDomainToFlow(
  model: DomainModel,
  evaluation: EvaluationResult,
  options: MapDomainToFlowOptions = {},
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const collapsed = options.collapsedDepartmentIds ?? new Set<string>()
  const costView = options.costView ?? 'contribution'

  const childrenByParent = new Map<string, string[]>()
  for (const node of model.nodes) {
    if (!node.parentId) continue
    const list = childrenByParent.get(node.parentId) ?? []
    list.push(node.id)
    childrenByParent.set(node.parentId, list)
  }

  const hidden = new Set<string>()
  for (const deptId of collapsed) {
    for (const childId of childrenByParent.get(deptId) ?? []) {
      hidden.add(childId)
    }
  }

  if (costView === 'contribution') {
    for (const node of model.nodes) {
      if (isAllocatedCost(model, node.id, evaluation)) {
        hidden.add(node.id)
      }
    }
  }

  const visibleNodes = model.nodes.filter((n) => !hidden.has(n.id))

  const nodes: Node<FlowNodeData>[] = visibleNodes.map((node) => {
    const result = evaluation.results[node.id]
    const viewType = resolveViewType(node)
    let displayValue = '—'
    let unresolved = false
    if (!result || result.value.status === 'unresolved') {
      unresolved = true
      displayValue =
        result?.value.status === 'unresolved'
          ? result.value.message || 'Unvollständig'
          : '—'
    } else {
      displayValue = `${result.value.perUnit.toFixed(2)} / Einh.`
    }

    const childIds = childrenByParent.get(node.id) ?? []
    const enabledChildren = childIds.filter((id) => {
      const child = model.nodes.find((n) => n.id === id)
      return child?.enabled !== false
    })
    const emptyDepartment = viewType === 'department' && enabledChildren.length === 0

    return {
      id: node.id,
      type: 'costGraphNode',
      position: { x: 0, y: 0 },
      data: {
        domainNodeId: node.id,
        label: node.label,
        kind: node.kind,
        viewType,
        displayValue,
        unresolved,
        allocationRule: result?.provenance.allocationRule ?? 'none',
        childCount: enabledChildren.length,
        collapsed: collapsed.has(node.id),
        emptyDepartment,
      },
    }
  })

  const visibleIds = new Set(nodes.map((n) => n.id))
  const edges: Edge[] = model.edges
    .filter((edge) => visibleIds.has(edge.sourceNodeId) && visibleIds.has(edge.targetNodeId))
    .map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: 'smoothstep',
    }))

  return { nodes, edges }
}
