/**
 * Product domain types and Zod schemas (pricing SoR).
 * Location: src/features/products/domain/product.ts
 */
import { z } from 'zod'

export const PriceKindSchema = z.enum(['gross', 'net'])
export const PricingBasisSchema = z.enum([
  'per_order',
  'per_unit',
  'per_customer',
  'per_month',
])

const ProductFieldsSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().length(3).default('EUR'),
  /** @deprecated Prefer sellingPrice — kept for legacy rows / remote mirror. */
  price: z.number().finite().nonnegative().optional(),
  sellingPrice: z.number().finite().nonnegative().optional(),
  priceKind: PriceKindSchema.default('gross'),
  /** VAT percent points, e.g. 19. */
  taxRatePercent: z.number().finite().nonnegative().lt(100).default(0),
  pricingBasis: PricingBasisSchema.default('per_unit'),
  /** Shipped template id (e.g. traffic-safety). Defaults to custom for legacy rows. */
  templateId: z.string().min(1).default('custom'),
  templateVersion: z.number().int().positive().optional(),
  /** Optional cost node keys included at create time. */
  includedOptionalKeys: z.array(z.string()).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

/**
 * Normalize legacy `price`-only products into pricing SoR.
 * Legacy: treat price as sellingPrice gross with taxRatePercent 0.
 */
export const ProductSchema = ProductFieldsSchema.transform((row) => {
  const sellingPrice = row.sellingPrice ?? row.price ?? 0
  return {
    ...row,
    sellingPrice,
    /** Mirror for callers still reading `.price`. */
    price: sellingPrice,
    priceKind: row.priceKind ?? 'gross',
    taxRatePercent: row.taxRatePercent ?? 0,
    pricingBasis: row.pricingBasis ?? 'per_unit',
  }
})

export type Product = z.output<typeof ProductSchema>
export type PriceKind = z.infer<typeof PriceKindSchema>
export type PricingBasis = z.infer<typeof PricingBasisSchema>

export type CreateProductInput = {
  businessId: string
  name: string
  currency?: string
  /** @deprecated use sellingPrice */
  price?: number
  sellingPrice?: number
  priceKind?: PriceKind
  taxRatePercent?: number
  pricingBasis?: PricingBasis
  templateId?: string
  templateVersion?: number
  includedOptionalKeys?: string[]
}

export type UpdateProductInput = {
  name?: string
  currency?: string
  price?: number
  sellingPrice?: number
  priceKind?: PriceKind
  taxRatePercent?: number
  pricingBasis?: PricingBasis
  templateId?: string
  templateVersion?: number
  includedOptionalKeys?: string[]
}

/** Resolve create/update input into canonical pricing fields. */
export function normalizePricingInput(input: {
  price?: number
  sellingPrice?: number
  priceKind?: PriceKind
  taxRatePercent?: number
  pricingBasis?: PricingBasis
  currency?: string
}): {
  sellingPrice: number
  priceKind: PriceKind
  taxRatePercent: number
  pricingBasis: PricingBasis
  currency: string
} {
  return {
    sellingPrice: input.sellingPrice ?? input.price ?? 0,
    priceKind: input.priceKind ?? 'gross',
    taxRatePercent: input.taxRatePercent ?? 0,
    pricingBasis: input.pricingBasis ?? 'per_unit',
    currency: input.currency ?? 'EUR',
  }
}
