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
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type Product = z.infer<typeof ProductSchema>

export type CreateProductInput = {
  businessId: string
  name: string
  currency?: string
  price?: number
}

export type UpdateProductInput = {
  name?: string
  currency?: string
  price?: number
}
