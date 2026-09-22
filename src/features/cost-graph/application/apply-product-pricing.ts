/**
 * Sync product pricing SoR into the revenue node of an existing model.
 * Location: src/features/cost-graph/application/apply-product-pricing.ts
 */
import type { DomainModel } from '@/core/model'
import { resolveNetRevenue } from '@/core/pricing'
import type { Product } from '@/features/products'

export function applyProductPricingToModel(
  model: DomainModel,
  product: Product,
): DomainModel {
  const pricing = resolveNetRevenue({
    sellingPrice: product.sellingPrice,
    priceKind: product.priceKind,
    taxRatePercent: product.taxRatePercent,
    pricingBasis: product.pricingBasis,
    currency: product.currency,
  })
  if (pricing.status !== 'ok') return model

  return {
    ...model,
    nodes: model.nodes.map((n) => {
      if (n.key !== 'revenue' && n.kind !== 'revenue') return n
      return {
        ...n,
        inputs: {
          ...n.inputs,
          price: pricing.netRevenue,
          grossRevenue: pricing.grossRevenue,
          taxRatePercent: pricing.taxRatePercent,
          netRevenue: pricing.netRevenue,
        },
      }
    }),
  }
}
