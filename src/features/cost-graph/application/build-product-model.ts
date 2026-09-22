/**
 * Build a domain model for a product from shipped or custom template definition.
 * Location: src/features/cost-graph/application/build-product-model.ts
 */
import type { DomainModel } from '@/core/model'
import type { Product } from '@/features/products'
import {
  applyTemplateById,
  resolveTemplateId,
  type ShippedTemplate,
} from '@/features/templates'

export function buildProductModel(
  product: Product,
  volume?: number,
  customDefinition?: ShippedTemplate,
): DomainModel {
  return applyTemplateById(resolveTemplateId(product), product, {
    volume,
    price: product.price,
    includedOptionalKeys: product.includedOptionalKeys,
    customDefinition,
  })
}
