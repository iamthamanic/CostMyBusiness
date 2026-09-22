/**
 * Product domain types and Zod schemas.
 * Location: src/features/products/domain/product.ts
 */
import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().length(3).default('EUR'),
  price: z.number().finite().nonnegative().optional(),
  /** Shipped template id (e.g. traffic-safety). Defaults to custom for legacy rows. */
  templateId: z.string().min(1).default('custom'),
  templateVersion: z.number().int().positive().optional(),
  /** Optional cost node keys included at create time. */
  includedOptionalKeys: z.array(z.string()).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type Product = z.infer<typeof ProductSchema>

export type CreateProductInput = {
  businessId: string
  name: string
  currency?: string
  price?: number
  templateId?: string
  templateVersion?: number
  includedOptionalKeys?: string[]
}

export type UpdateProductInput = {
  name?: string
  currency?: string
  price?: number
  templateId?: string
  templateVersion?: number
  includedOptionalKeys?: string[]
}
