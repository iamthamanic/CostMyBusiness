/**
 * Products feature public API.
 * Location: src/features/products/index.ts
 */
export type { Product, CreateProductInput, UpdateProductInput, PriceKind, PricingBasis } from './domain/product'
export { ProductSchema, normalizePricingInput } from './domain/product'
export type { ProductRepository } from './application/product-repository'
export { ProductsPage } from './ui/ProductsPage'
export { ProductDetailPage } from './ui/ProductDetailPage'
