/**
 * Build a domain model for a product from its shipped template (or custom fallback).
 * Location: src/features/cost-graph/application/build-product-model.ts
 */
import type { DomainModel } from '@/core/model'
import type { Product } from '@/features/products'
import { applyTemplateById, resolveTemplateId } from '@/features/templates'

export function buildProductModel(product: Product, volume?: number): DomainModel {
  return applyTemplateById(resolveTemplateId(product), product, {
    volume,
    price: product.price,
    includedOptionalKeys: product.includedOptionalKeys,
  })
}
