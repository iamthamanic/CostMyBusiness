/**
 * Marketing funnel domain types and Zod schemas.
 * Location: src/features/funnels/domain/marketing-funnel.ts
 */
import { z } from 'zod'

export const FunnelStageSchema = z.object({
  key: z.string().min(1),
  labelDe: z.string().min(1),
  order: z.number().int().nonnegative(),
  /** Absolute count at this stage when known (e.g. impressions, clicks, conversions). */
  count: z.number().finite().nonnegative().optional(),
  /** Conversion rate into this stage from the previous stage (0–1). */
  conversionRate: z.number().finite().min(0).max(1).optional(),
})

export const MarketingOperatingCostsSchema = z.object({
  mediaSpend: z.number().finite().nonnegative().default(0),
  agency: z.number().finite().nonnegative().default(0),
  personnel: z.number().finite().nonnegative().default(0),
  tools: z.number().finite().nonnegative().default(0),
})

/** Campaign inside a marketing funnel — name, CPA, conversion rate. */
export const MarketingCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** EUR per conversion (CPA). */
  costPerConversion: z.number().finite().nonnegative().default(0),
  /** Conversion rate 0–1 (UI may show %). */
  conversionRate: z.number().finite().min(0).max(1).default(0),
  /** Standard acquisition vs retarget follow-on. */
  kind: z.enum(['standard', 'retarget']).default('standard'),
})

export const MarketingFunnelSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  type: z.literal('marketing'),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  stages: z.array(FunnelStageSchema).min(1),
  costs: MarketingOperatingCostsSchema,
  campaigns: z.array(MarketingCampaignSchema).default([]),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type FunnelStage = z.infer<typeof FunnelStageSchema>
export type MarketingOperatingCosts = z.infer<typeof MarketingOperatingCostsSchema>
export type MarketingCampaign = z.infer<typeof MarketingCampaignSchema>
export type MarketingFunnel = z.infer<typeof MarketingFunnelSchema>

export type CreateMarketingFunnelInput = {
  productId: string
  name: string
  stages?: FunnelStage[]
  costs?: Partial<MarketingOperatingCosts>
  campaigns?: MarketingCampaign[]
}

export type UpdateMarketingFunnelInput = {
  name?: string
  stages?: FunnelStage[]
  costs?: Partial<MarketingOperatingCosts>
  enabled?: boolean
  campaigns?: MarketingCampaign[]
}

export function createEmptyCampaign(
  name = 'Neue Kampagne',
  kind: 'standard' | 'retarget' = 'standard',
): MarketingCampaign {
  return {
    id: `cmp_${crypto.randomUUID().slice(0, 8)}`,
    name,
    costPerConversion: 0,
    conversionRate: 0,
    kind,
  }
}

/** Default Google-Ads-like stages for new funnels. */
export function defaultMarketingStages(): FunnelStage[] {
  return [
    { key: 'impressions', labelDe: 'Impressionen', order: 0, count: 0 },
    { key: 'clicks', labelDe: 'Klicks', order: 1, conversionRate: 0 },
    { key: 'conversions', labelDe: 'Conversions', order: 2, conversionRate: 0 },
  ]
}
