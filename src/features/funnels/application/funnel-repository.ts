/**
 * Funnel repository port (marketing funnels for V1 of this ticket).
 * Location: src/features/funnels/application/funnel-repository.ts
 */
import type {
  CreateMarketingFunnelInput,
  MarketingFunnel,
  UpdateMarketingFunnelInput,
} from '../domain/marketing-funnel'

export type FunnelRepository = {
  listByProduct(productId: string): Promise<MarketingFunnel[]>
  get(id: string): Promise<MarketingFunnel | null>
  createMarketing(input: CreateMarketingFunnelInput): Promise<MarketingFunnel>
  update(id: string, input: UpdateMarketingFunnelInput): Promise<MarketingFunnel>
  delete(id: string): Promise<void>
}
