/**
 * Compose ProductFunnel entities into DomainModel cost nodes (calculation SoR).
 * Location: src/features/cost-graph/application/compose-funnels-into-model.ts
 */
import type { DomainEdge, DomainModel, DomainNode } from '@/core/model'
import {
  calculateMarketingMetrics,
  calculateSalesMetrics,
  type ProductFunnel,
} from '@/features/funnels'

function funnelNodeId(funnelId: string): string {
  return `n_funnel_${funnelId}`
}

function parentDepartment(
  model: DomainModel,
  funnel: ProductFunnel,
): DomainNode | undefined {
  const prefer =
    funnel.type === 'marketing'
      ? ['g_marketing', 'g_acquisition', 'marketing']
      : ['g_sales', 'g_acquisition', 'sales']
  for (const key of prefer) {
    const found = model.nodes.find((n) => n.key === key && n.kind === 'group')
    if (found) return found
  }
  return undefined
}

/**
 * Returns a new model with funnel-derived cost nodes feeding contribution + department.
 * Removes prior `n_funnel_*` nodes so recompose is idempotent.
 */
export function composeFunnelsIntoModel(
  model: DomainModel,
  funnels: ProductFunnel[],
): DomainModel {
  const withoutPrior = {
    ...model,
    nodes: model.nodes.filter((n) => !n.id.startsWith('n_funnel_') && !n.key.startsWith('funnel_')),
    edges: model.edges.filter(
      (e) => !e.sourceNodeId.startsWith('n_funnel_') && !e.targetNodeId.startsWith('n_funnel_'),
    ),
  }

  const contribution = withoutPrior.nodes.find((n) => n.key === 'contribution')
  const nodes: DomainNode[] = [...withoutPrior.nodes]
  const edges: DomainEdge[] = [...withoutPrior.edges]

  for (const funnel of funnels) {
    const parent = parentDepartment(withoutPrior, funnel)
    const id = funnelNodeId(funnel.id)
    const key = `funnel_${funnel.id}`

    let rate: number | undefined
    if (funnel.type === 'marketing') {
      const m = calculateMarketingMetrics(funnel)
      if (m.fullyLoadedCac.status === 'ok') {
        rate = m.fullyLoadedCac.value
      }
    } else {
      const m = calculateSalesMetrics(funnel)
      if (m.salesAcquisitionCost.status === 'ok') {
        rate = m.salesAcquisitionCost.value
      }
    }

    const costInputs: Record<string, number> =
      funnel.type === 'marketing'
        ? {
            mediaSpend: funnel.costs.mediaSpend,
            agency: funnel.costs.agency,
            personnel: funnel.costs.personnel,
            tools: funnel.costs.tools,
            ...(rate !== undefined ? { rate } : {}),
          }
        : {
            personnel: funnel.costs.personnel,
            crm: funnel.costs.crm,
            commission: funnel.costs.commission,
            tools: funnel.costs.tools,
            ...(rate !== undefined ? { rate } : {}),
          }

    nodes.push({
      id,
      kind: 'cost',
      key,
      label: funnel.name,
      // User disable wins; incomplete funnels stay enabled in UI but contribute 0 via missing rate edge.
      enabled: funnel.enabled ?? true,
      parentId: parent?.id,
      costBehavior: 'per_order',
      inputs: costInputs,
      allocation: { rule: 'direct' },
    })

    if (contribution && rate !== undefined && (funnel.enabled ?? true)) {
      edges.push({
        id: `e_${id}_contribution`,
        sourceNodeId: id,
        targetNodeId: contribution.id,
        relation: 'feeds',
      })
    }
    if (parent && rate !== undefined && (funnel.enabled ?? true)) {
      edges.push({
        id: `e_${id}_${parent.key}`,
        sourceNodeId: id,
        targetNodeId: parent.id,
        relation: 'depends_on',
      })
    }
  }

  return { ...withoutPrior, nodes, edges }
}

export function isFunnelDomainNode(node: DomainNode): boolean {
  return node.key.startsWith('funnel_') || node.id.startsWith('n_funnel_')
}
