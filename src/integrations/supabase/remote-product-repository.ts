/**
 * Remote ProductRepository backed by Supabase (RLS-enforced).
 * Location: src/integrations/supabase/remote-product-repository.ts
 */
import type { ProductRepository } from '@/features/products/application/product-repository'
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@/features/products/domain/product'
import type { AppSupabaseClient } from './client'

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  if (!value.every((item) => typeof item === 'string')) return undefined
  return value
}

function mapProduct(row: {
  id: string
  business_id: string
  name: string
  currency: string
  price: number | null
  template_id: string
  template_version: number | null
  included_optional_keys: unknown
  created_at: string
  updated_at: string
}): Product {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    currency: row.currency,
    price: row.price ?? undefined,
    templateId: row.template_id,
    templateVersion: row.template_version ?? undefined,
    includedOptionalKeys: asStringArray(row.included_optional_keys),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createRemoteProductRepository(
  client: AppSupabaseClient,
  getOwnerId: () => Promise<string>,
): ProductRepository {
  return {
    async listByBusiness(businessId) {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapProduct)
    },
    async get(id) {
      const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle()
      if (error) throw new Error(error.message)
      return data ? mapProduct(data) : null
    },
    async getInBusiness(businessId, id) {
      const product = await this.get(id)
      if (!product || product.businessId !== businessId) return null
      return product
    },
    async create(input: CreateProductInput) {
      const ownerId = await getOwnerId()
      const { data, error } = await client
        .from('products')
        .insert({
          business_id: input.businessId,
          owner_id: ownerId,
          name: input.name,
          currency: input.currency ?? 'EUR',
          price: input.price ?? null,
          template_id: input.templateId ?? 'custom',
          template_version: input.templateVersion ?? null,
          included_optional_keys: input.includedOptionalKeys ?? null,
        })
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return mapProduct(data)
    },
    async update(id, input: UpdateProductInput) {
      const { data, error } = await client
        .from('products')
        .update({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.currency !== undefined ? { currency: input.currency } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.templateId !== undefined ? { template_id: input.templateId } : {}),
          ...(input.templateVersion !== undefined
            ? { template_version: input.templateVersion }
            : {}),
          ...(input.includedOptionalKeys !== undefined
            ? { included_optional_keys: input.includedOptionalKeys }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return mapProduct(data)
    },
    async delete(id) {
      const { error } = await client.from('products').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
  }
}
