/**
 * Maps domain graph → React Flow objects (visualization only, not SoR).
 * Location: src/features/cost-graph/application/map-domain-to-flow.ts
 */
import type { Edge, Node } from '@xyflow/react'
import type { CostBehavior, DomainModel, EvaluationResult, NodeId } from '@/core/model'
import { formatDerivation, inputSchemaFor } from './input-schemas'
import { resolveViewType, type CostGraphViewType } from './view-node-type'

export type FlowNodeData = {
  domainNodeId: NodeId
  label: string
  kind: string
  viewType: CostGraphViewType
  displayValue: string
  unresolved: boolean
  unresolvedMessage?: string
  allocationRule: string
  childCount: number
  collapsed: boolean
  emptyDepartment: boolean
  expanded: boolean
  costBehavior?: CostBehavior
  inputs: Record<string, number>
  derivationDe: string
  schemaFields: ReturnType<typeof inputSchemaFor>['fields']
  onToggleExpand?: () => void
  onInputChange?: (fieldId: string, value: number) => void
}

export type MapDomainToFlowOptions = {
  collapsedDepartmentIds?: Set<string>
  costView?: 'contribution' | 'fullyLoaded'
  expandedNodeIds?: Set<string>
  onToggleExpand?: (nodeId: string) => void
  onInputChange?: (nodeId: string, fieldId: string, value: number) => void
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
  const expanded = options.expandedNodeIds ?? new Set<string>()
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
    let unresolvedMessage: string | undefined
    if (!result || result.value.status === 'unresolved') {
      unresolved = true
      unresolvedMessage =
        result?.value.status === 'unresolved' ? result.value.message : 'Unvollständig'
      displayValue = 'Unvollständig'
    } else {
      displayValue = `${result.value.perUnit.toFixed(2)} EUR / Einh.`
    }

    const childIds = childrenByParent.get(node.id) ?? []
    const enabledChildren = childIds.filter((id) => {
      const child = model.nodes.find((n) => n.id === id)
      return child?.enabled !== false
    })
    const emptyDepartment = viewType === 'department' && enabledChildren.length === 0
    const isExpanded = expanded.has(node.id)
    const schema = inputSchemaFor(node.costBehavior)

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
        unresolvedMessage,
        allocationRule: result?.provenance.allocationRule ?? 'none',
        childCount: enabledChildren.length,
        collapsed: collapsed.has(node.id),
        emptyDepartment,
        expanded: isExpanded,
        costBehavior: node.costBehavior,
        inputs: { ...node.inputs },
        derivationDe: formatDerivation(node.costBehavior, node.inputs),
        schemaFields: schema.fields,
        onToggleExpand:
          viewType === 'costCalculator' || viewType === 'productPrice' || viewType === 'revenue'
            ? () => options.onToggleExpand?.(node.id)
            : undefined,
        onInputChange:
          viewType === 'costCalculator'
            ? (fieldId, value) => options.onInputChange?.(node.id, fieldId, value)
            : undefined,
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
