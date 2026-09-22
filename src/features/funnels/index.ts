/**
 * Funnels feature public API.
 * Location: src/features/funnels/index.ts
 */
export {
  calculateMarketingMetrics,
  type FunnelMetricValue,
  type MarketingFunnelMetrics,
} from './application/calculate-marketing-metrics'
export type { FunnelRepository } from './application/funnel-repository'
export {
  MarketingFunnelSchema,
  defaultMarketingStages,
  type CreateMarketingFunnelInput,
  type FunnelStage,
  type MarketingFunnel,
  type UpdateMarketingFunnelInput,
} from './domain/marketing-funnel'
export { MarketingFunnelsPanel } from './ui/MarketingFunnelsPanel'
