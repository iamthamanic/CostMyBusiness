/**
 * Attribute profitability view to a selected funnel (filter context).
 * Location: src/features/funnels/application/funnel-filter.ts
 */
import type { DomainModel, EvaluationResult } from '@/core/model'
import { evaluate } from '@/core/calculation'
import type { MarketingFunnel } from '../domain/marketing-funnel'
import type { SalesFunnel } from '../domain/sales-funnel'
import { calculateMarketingMetrics } from './calculate-marketing-metrics'
import { calculateSalesMetrics } from './calculate-sales-metrics'

export type ProductFunnel = MarketingFunnel | SalesFunnel

export type FunnelFilterResult =
  | {
      status: 'ok'
      funnelId: string
      funnelName: string
      funnelType: 'marketing' | 'sales'
      acquisitionCostPerUnit: number
      contributionPerUnit: number | null
      contributionPeriod: number | null
      noteDe: string
    }
  | {
      status: 'unresolved'
      messageDe: string
      missing: string[]
    }

/**
 * When a funnel is selected, report acquisition cost from that funnel plus
 * current model contribution. Without a funnel, explain that attribution is inactive.
 */
export function filterProfitabilityByFunnel(
  model: DomainModel,
  funnel: ProductFunnel | null,
): FunnelFilterResult {
  if (!funnel) {
    return {
      status: 'unresolved',
      messageDe:
        'Kein Funnel-Filter aktiv. Wählen Sie einen Funnel, um Akquisekosten diesem Kanal zuzuordnen.',
      missing: ['funnelId'],
    }
  }

  const evaluation: EvaluationResult = evaluate(model)
  const contributionNode = model.nodes.find((n) => n.key === 'contribution')
  const contribution = contributionNode ? evaluation.results[contributionNode.id] : undefined

  let acquisitionCostPerUnit: number | null = null
  if (funnel.type === 'marketing') {
    const metrics = calculateMarketingMetrics(funnel)
    if (metrics.fullyLoadedCac.status === 'ok') {
      acquisitionCostPerUnit = metrics.fullyLoadedCac.value
    } else {
      return {
        status: 'unresolved',
        messageDe: metrics.fullyLoadedCac.messageDe,
        missing: [metrics.fullyLoadedCac.reason],
      }
    }
  } else {
    const metrics = calculateSalesMetrics(funnel)
    if (metrics.salesAcquisitionCost.status === 'ok') {
      acquisitionCostPerUnit = metrics.salesAcquisitionCost.value
    } else {
      return {
        status: 'unresolved',
        messageDe: metrics.salesAcquisitionCost.messageDe,
        missing: [metrics.salesAcquisitionCost.reason],
      }
    }
  }

  return {
    status: 'ok',
    funnelId: funnel.id,
    funnelName: funnel.name,
    funnelType: funnel.type,
    acquisitionCostPerUnit,
    contributionPerUnit:
      contribution?.value.status === 'ok' ? contribution.value.perUnit : null,
    contributionPeriod:
      contribution?.value.status === 'ok' ? contribution.value.periodTotal : null,
    noteDe: `Akquisekosten und Deckungsbeitrag für Funnel „${funnel.name}“ (${funnel.type}).`,
  }
}
