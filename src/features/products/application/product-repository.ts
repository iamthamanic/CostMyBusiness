/**
 * Product repository port.
 * Location: src/features/products/application/product-repository.ts
 */
import type { CreateProductInput, Product, UpdateProductInput } from '../domain/product'

export type ProductRepository = {
  listByBusiness(businessId: string): Promise<Product[]>
  get(id: string): Promise<Product | null>
  /** Returns product only when it belongs to businessId. */
  getInBusiness(businessId: string, id: string): Promise<Product | null>
  create(input: CreateProductInput): Promise<Product>
  update(id: string, input: UpdateProductInput): Promise<Product>
  delete(id: string): Promise<void>
}
