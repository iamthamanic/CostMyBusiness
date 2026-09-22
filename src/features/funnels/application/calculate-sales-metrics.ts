/**
 * Pure sales-funnel metric derivation (sales acquisition cost).
 * Location: src/features/funnels/application/calculate-sales-metrics.ts
 */
import type { SalesFunnel } from '../domain/sales-funnel'
import type { FunnelMetricValue } from './calculate-marketing-metrics'

export type SalesFunnelMetrics = {
  leads: FunnelMetricValue
  won: FunnelMetricValue
  salesAcquisitionCost: FunnelMetricValue
  fullyLoadedSpend: number
}

function stageCount(funnel: SalesFunnel, key: string): number | undefined {
  return funnel.stages.find((s) => s.key === key)?.count
}

function unresolved(messageDe: string, reason: string): FunnelMetricValue {
  return { status: 'unresolved', reason, messageDe, scope: 'fully_loaded' }
}

function ok(value: number): FunnelMetricValue {
  return { status: 'ok', value, scope: 'fully_loaded' }
}

/**
 * Sales acquisition cost = (personnel + crm + commission + tools) / won deals.
 */
export function calculateSalesMetrics(funnel: SalesFunnel): SalesFunnelMetrics {
  const leadsCount = stageCount(funnel, 'leads')
  let wonCount = stageCount(funnel, 'won')

  // Cascade through conversion rates when intermediate counts missing
  let current = leadsCount
  const ordered = [...funnel.stages].sort((a, b) => a.order - b.order)
  for (const stage of ordered) {
    if (stage.key === 'leads') continue
    if (stage.count !== undefined) {
      current = stage.count
    } else if (current !== undefined && stage.conversionRate !== undefined) {
      current = current * stage.conversionRate
    }
    if (stage.key === 'won' && wonCount === undefined) wonCount = current
  }

  const leads: FunnelMetricValue =
    leadsCount === undefined
      ? unresolved('Leads fehlen.', 'missing_leads')
      : ok(leadsCount)

  const won: FunnelMetricValue =
    wonCount === undefined
      ? unresolved('Gewonnene Deals fehlen — Sales-CAC nicht berechenbar.', 'missing_won')
      : ok(wonCount)

  const fullyLoadedSpend =
    funnel.costs.personnel + funnel.costs.crm + funnel.costs.commission + funnel.costs.tools

  let salesAcquisitionCost: FunnelMetricValue
  if (won.status !== 'ok') {
    salesAcquisitionCost = unresolved(won.messageDe, won.reason)
  } else if (won.value === 0) {
    salesAcquisitionCost = unresolved(
      'Sales-CAC nicht berechenbar: 0 gewonnene Deals.',
      'zero_won',
    )
  } else {
    salesAcquisitionCost = ok(fullyLoadedSpend / won.value)
  }

  return { leads, won, salesAcquisitionCost, fullyLoadedSpend }
}
