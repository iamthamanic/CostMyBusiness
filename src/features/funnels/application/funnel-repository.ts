/**
 * Funnel repository port — marketing and sales funnels.
 * Location: src/features/funnels/application/funnel-repository.ts
 */
import type {
  CreateMarketingFunnelInput,
  FunnelStage,
  MarketingFunnel,
  MarketingOperatingCosts,
} from '../domain/marketing-funnel'
import type {
  CreateSalesFunnelInput,
  SalesFunnel,
  SalesOperatingCosts,
} from '../domain/sales-funnel'
import type { ProductFunnel } from './funnel-filter'

export type UpdateFunnelInput = {
  name?: string
  stages?: FunnelStage[]
  marketingCosts?: Partial<MarketingOperatingCosts>
  salesCosts?: Partial<SalesOperatingCosts>
}

export type FunnelRepository = {
  listByProduct(productId: string): Promise<ProductFunnel[]>
  get(id: string): Promise<ProductFunnel | null>
  createMarketing(input: CreateMarketingFunnelInput): Promise<MarketingFunnel>
  createSales(input: CreateSalesFunnelInput): Promise<SalesFunnel>
  update(id: string, input: UpdateFunnelInput): Promise<ProductFunnel>
  delete(id: string): Promise<void>
}
