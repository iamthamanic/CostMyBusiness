/**
 * Funnels feature public API.
 * Location: src/features/funnels/index.ts
 */
export {
  calculateMarketingMetrics,
  blendCampaignCpa,
  type FunnelMetricValue,
  type MarketingFunnelMetrics,
} from './application/calculate-marketing-metrics'
export { calculateSalesMetrics, type SalesFunnelMetrics } from './application/calculate-sales-metrics'
export {
  filterProfitabilityByFunnel,
  type FunnelFilterResult,
  type ProductFunnel,
} from './application/funnel-filter'
export type { FunnelRepository, UpdateFunnelInput } from './application/funnel-repository'
export {
  MarketingFunnelSchema,
  MarketingCampaignSchema,
  defaultMarketingStages,
  createEmptyCampaign,
  type CreateMarketingFunnelInput,
  type FunnelStage,
  type MarketingCampaign,
  type MarketingFunnel,
  type UpdateMarketingFunnelInput,
} from './domain/marketing-funnel'
export {
  SalesFunnelSchema,
  defaultSalesStages,
  type CreateSalesFunnelInput,
  type SalesFunnel,
} from './domain/sales-funnel'
export { MarketingFunnelsPanel } from './ui/MarketingFunnelsPanel'
export { SalesFunnelsPanel } from './ui/SalesFunnelsPanel'
export { FunnelFilterPanel } from './ui/FunnelFilterPanel'
export { BreakEvenPanel } from './ui/BreakEvenPanel'
