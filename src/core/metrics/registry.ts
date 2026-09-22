/**
 * Universal metric registry with stable IDs.
 * Location: src/core/metrics/registry.ts
 */

export type MetricId =
  | 'revenue'
  | 'net_revenue'
  | 'ctr'
  | 'cpc'
  | 'cvr'
  | 'cpa'
  | 'cac'
  | 'contribution'
  | 'contribution_margin'
  | 'fully_loaded_profit'
  | 'break_even_units'

export type MetricDefinition = {
  id: MetricId
  labelKey: string
  descriptionKey: string
}

export const METRIC_REGISTRY: readonly MetricDefinition[] = [
  { id: 'revenue', labelKey: 'metric.revenue', descriptionKey: 'metric.revenue.desc' },
  { id: 'net_revenue', labelKey: 'metric.net_revenue', descriptionKey: 'metric.net_revenue.desc' },
  { id: 'ctr', labelKey: 'metric.ctr', descriptionKey: 'metric.ctr.desc' },
  { id: 'cpc', labelKey: 'metric.cpc', descriptionKey: 'metric.cpc.desc' },
  { id: 'cvr', labelKey: 'metric.cvr', descriptionKey: 'metric.cvr.desc' },
  { id: 'cpa', labelKey: 'metric.cpa', descriptionKey: 'metric.cpa.desc' },
  { id: 'cac', labelKey: 'metric.cac', descriptionKey: 'metric.cac.desc' },
  { id: 'contribution', labelKey: 'metric.contribution', descriptionKey: 'metric.contribution.desc' },
  {
    id: 'contribution_margin',
    labelKey: 'metric.contribution_margin',
    descriptionKey: 'metric.contribution_margin.desc',
  },
  {
    id: 'fully_loaded_profit',
    labelKey: 'metric.fully_loaded_profit',
    descriptionKey: 'metric.fully_loaded_profit.desc',
  },
  {
    id: 'break_even_units',
    labelKey: 'metric.break_even_units',
    descriptionKey: 'metric.break_even_units.desc',
  },
] as const

export function getMetric(id: MetricId): MetricDefinition {
  const found = METRIC_REGISTRY.find((m) => m.id === id)
  if (!found) {
    throw new Error(`Unknown metric id: ${id}`)
  }
  return found
}

export function listMetricIds(): MetricId[] {
  return METRIC_REGISTRY.map((m) => m.id)
}
