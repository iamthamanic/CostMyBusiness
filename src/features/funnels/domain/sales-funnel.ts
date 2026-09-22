/**
 * Sales funnel domain types (B2B stages + sales operating costs).
 * Location: src/features/funnels/domain/sales-funnel.ts
 */
import { z } from 'zod'
import { FunnelStageSchema, type FunnelStage } from './marketing-funnel'

export const SalesOperatingCostsSchema = z.object({
  personnel: z.number().finite().nonnegative().default(0),
  crm: z.number().finite().nonnegative().default(0),
  commission: z.number().finite().nonnegative().default(0),
  tools: z.number().finite().nonnegative().default(0),
})

export const SalesFunnelSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  type: z.literal('sales'),
  name: z.string().min(1),
  stages: z.array(FunnelStageSchema).min(1),
  costs: SalesOperatingCostsSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type SalesOperatingCosts = z.infer<typeof SalesOperatingCostsSchema>
export type SalesFunnel = z.infer<typeof SalesFunnelSchema>

export type CreateSalesFunnelInput = {
  productId: string
  name: string
  stages?: FunnelStage[]
  costs?: Partial<SalesOperatingCosts>
}

export function defaultSalesStages(): FunnelStage[] {
  return [
    { key: 'leads', labelDe: 'Leads', order: 0, count: 0 },
    { key: 'mql', labelDe: 'MQL', order: 1, conversionRate: 0 },
    { key: 'sql', labelDe: 'SQL', order: 2, conversionRate: 0 },
    { key: 'proposal', labelDe: 'Angebot', order: 3, conversionRate: 0 },
    { key: 'won', labelDe: 'Gewonnen', order: 4, conversionRate: 0 },
  ]
}
