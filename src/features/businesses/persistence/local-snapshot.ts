/**
 * Combined Zod-validated local snapshot for businesses + products.
 * Location: src/features/businesses/persistence/local-snapshot.ts
 */
import { z } from 'zod'
import { BusinessSchema } from '../domain/business'
import { ProductSchema } from '../../products/domain/product'

export const LocalSnapshotSchema = z.object({
  version: z.literal(1),
  businesses: z.array(BusinessSchema),
  products: z.array(ProductSchema),
})

export type LocalSnapshot = z.infer<typeof LocalSnapshotSchema>

export function emptySnapshot(): LocalSnapshot {
  return { version: 1, businesses: [], products: [] }
}

export function parseSnapshot(raw: unknown): LocalSnapshot {
  return LocalSnapshotSchema.parse(raw)
}
