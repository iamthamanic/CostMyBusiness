/**
 * Remote BusinessRepository backed by Supabase (RLS-enforced).
 * Location: src/integrations/supabase/remote-business-repository.ts
 */
import type { BusinessRepository } from '@/features/businesses/application/business-repository'
import type {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
} from '@/features/businesses/domain/business'
import type { AppSupabaseClient } from './client'

function mapBusiness(row: {
  id: string
  workspace_id: string
  name: string
  default_currency: string
  created_at: string
  updated_at: string
}): Business {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    defaultCurrency: row.default_currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createRemoteBusinessRepository(
  client: AppSupabaseClient,
  getOwnerId: () => Promise<string>,
): BusinessRepository {
  return {
    async list(workspaceId) {
      const { data, error } = await client
        .from('businesses')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapBusiness)
    },
    async get(id) {
      const { data, error } = await client.from('businesses').select('*').eq('id', id).maybeSingle()
      if (error) throw new Error(error.message)
      return data ? mapBusiness(data) : null
    },
    async create(input: CreateBusinessInput) {
      const ownerId = await getOwnerId()
      const { data, error } = await client
        .from('businesses')
        .insert({
          workspace_id: input.workspaceId,
          owner_id: ownerId,
          name: input.name,
          default_currency: input.defaultCurrency ?? 'EUR',
        })
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return mapBusiness(data)
    },
    async update(id, input: UpdateBusinessInput) {
      const { data, error } = await client
        .from('businesses')
        .update({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.defaultCurrency !== undefined
            ? { default_currency: input.defaultCurrency }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return mapBusiness(data)
    },
    async delete(id) {
      const { error } = await client.from('businesses').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
  }
}
