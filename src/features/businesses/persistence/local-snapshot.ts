/**
 * Combined Zod-validated local snapshot for businesses + products + funnels.
 * Location: src/features/businesses/persistence/local-snapshot.ts
 */
import { z } from 'zod'
import { BusinessSchema } from '../domain/business'
import { ProductSchema } from '../../products/domain/product'
import { MarketingFunnelSchema } from '../../funnels/domain/marketing-funnel'
import { ProductPlanningStateSchema } from '../../scenarios/domain/planning'

export const LocalSnapshotSchema = z.object({
  version: z.literal(1),
  businesses: z.array(BusinessSchema),
  products: z.array(ProductSchema),
  funnels: z.array(MarketingFunnelSchema).default([]),
  planning: z.array(ProductPlanningStateSchema).default([]),
})

export type LocalSnapshot = z.infer<typeof LocalSnapshotSchema>

export function emptySnapshot(): LocalSnapshot {
  return { version: 1, businesses: [], products: [], funnels: [], planning: [] }
}

export function parseSnapshot(raw: unknown): LocalSnapshot {
  return LocalSnapshotSchema.parse(raw)
}
