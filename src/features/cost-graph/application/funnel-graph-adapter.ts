/**
 * Adapt ProductFunnel entities into Cost Graph view nodes (RF only — domain SoR stays funnels/).
 * Location: src/features/cost-graph/application/funnel-graph-adapter.ts
 */
import type { Edge, Node } from '@xyflow/react'
import type { DomainModel } from '@/core/model'
import {
  calculateMarketingMetrics,
  calculateSalesMetrics,
  type ProductFunnel,
} from '@/features/funnels'
import type { FlowNodeData } from './map-domain-to-flow'

export function funnelFlowNodeId(funnelId: string): string {
  return `funnel:${funnelId}`
}

function parentDepartmentId(model: DomainModel, funnel: ProductFunnel): string | null {
  const prefer =
    funnel.type === 'marketing'
      ? ['g_marketing', 'g_acquisition', 'marketing', 'acquisition']
      : ['g_sales', 'g_acquisition', 'sales', 'acquisition']
  for (const key of prefer) {
    const found = model.nodes.find((n) => n.key === key && n.kind === 'group')
    if (found) return found.id
  }
  return null
}

/**
 * Build visualization-only funnel nodes + edges into department groups.
 */
export function mapFunnelsToFlow(
  model: DomainModel,
  funnels: ProductFunnel[],
  options: {
    collapsedDepartmentIds?: Set<string>
    expandedNodeIds?: Set<string>
    onToggleExpand?: (nodeId: string) => void
    onFunnelCostChange?: (
      funnelId: string,
      patch: { marketingCosts?: Record<string, number>; salesCosts?: Record<string, number> },
    ) => void
  } = {},
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const collapsed = options.collapsedDepartmentIds ?? new Set<string>()
  const expanded = options.expandedNodeIds ?? new Set<string>()
  const nodes: Node<FlowNodeData>[] = []
  const edges: Edge[] = []

  for (const funnel of funnels) {
    const parentId = parentDepartmentId(model, funnel)
    if (parentId && collapsed.has(parentId)) continue

    const nodeId = funnelFlowNodeId(funnel.id)
    const isExpanded = expanded.has(nodeId)

    let displayValue = '—'
    let unresolved = false
    let unresolvedMessage: string | undefined
    let cacLabel = ''

    if (funnel.type === 'marketing') {
      const metrics = calculateMarketingMetrics(funnel)
      if (metrics.fullyLoadedCac.status === 'ok') {
        displayValue = `CAC ${metrics.fullyLoadedCac.value.toFixed(2)} EUR`
        cacLabel = metrics.mediaCpa.status === 'ok'
          ? `Media CPA ${metrics.mediaCpa.value.toFixed(2)}`
          : ''
      } else {
        unresolved = true
        unresolvedMessage = metrics.fullyLoadedCac.messageDe
        displayValue = 'Unvollständig'
      }
    } else {
      const metrics = calculateSalesMetrics(funnel)
      if (metrics.salesAcquisitionCost.status === 'ok') {
        displayValue = `Sales-CAC ${metrics.salesAcquisitionCost.value.toFixed(2)} EUR`
      } else {
        unresolved = true
        unresolvedMessage = metrics.salesAcquisitionCost.messageDe
        displayValue = 'Unvollständig'
      }
    }

    const costInputs: Record<string, number> =
      funnel.type === 'marketing'
        ? {
            mediaSpend: funnel.costs.mediaSpend,
            agency: funnel.costs.agency,
            personnel: funnel.costs.personnel,
            tools: funnel.costs.tools,
          }
        : {
            personnel: funnel.costs.personnel,
            crm: funnel.costs.crm,
            commission: funnel.costs.commission,
            tools: funnel.costs.tools,
          }

    const schemaFields =
      funnel.type === 'marketing'
        ? [
            { id: 'mediaSpend', labelDe: 'Media-Budget', unitDe: 'EUR', required: true },
            { id: 'agency', labelDe: 'Agentur', unitDe: 'EUR', required: false },
            { id: 'personnel', labelDe: 'Personal', unitDe: 'EUR', required: false },
            { id: 'tools', labelDe: 'Tools', unitDe: 'EUR', required: false },
          ]
        : [
            { id: 'personnel', labelDe: 'Personal', unitDe: 'EUR', required: false },
            { id: 'crm', labelDe: 'CRM', unitDe: 'EUR', required: false },
            { id: 'commission', labelDe: 'Provision', unitDe: 'EUR', required: false },
            { id: 'tools', labelDe: 'Tools', unitDe: 'EUR', required: false },
          ]

    nodes.push({
      id: nodeId,
      type: 'costGraphNode',
      position: { x: 0, y: 0 },
      data: {
        domainNodeId: nodeId,
        label: funnel.name,
        kind: 'funnel',
        viewType: 'funnel',
        displayValue: cacLabel ? `${displayValue} · ${cacLabel}` : displayValue,
        unresolved,
        unresolvedMessage,
        allocationRule: 'direct',
        childCount: 0,
        collapsed: false,
        emptyDepartment: false,
        expanded: isExpanded,
        inputs: costInputs,
        derivationDe:
          funnel.type === 'marketing'
            ? 'Fully-loaded CAC = (Media+Agentur+Personal+Tools) / Conversions'
            : 'Sales-CAC = (Personal+CRM+Provision+Tools) / Gewonnen',
        schemaFields,
        onToggleExpand: () => options.onToggleExpand?.(nodeId),
        onInputChange: (fieldId, value) => {
          if (funnel.type === 'marketing') {
            options.onFunnelCostChange?.(funnel.id, {
              marketingCosts: { [fieldId]: value },
            })
          } else {
            options.onFunnelCostChange?.(funnel.id, {
              salesCosts: { [fieldId]: value },
            })
          }
        },
      },
    })

    if (parentId) {
      edges.push({
        id: `e_${nodeId}_${parentId}`,
        source: nodeId,
        target: parentId,
        type: 'smoothstep',
      })
    }
  }

  return { nodes, edges }
}
