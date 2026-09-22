/**
 * Business repository port — implemented by local and later Supabase adapters.
 * Location: src/features/businesses/application/business-repository.ts
 */
import type { Business, CreateBusinessInput, UpdateBusinessInput } from '../domain/business'

export type BusinessRepository = {
  list(workspaceId: string): Promise<Business[]>
  get(id: string): Promise<Business | null>
  create(input: CreateBusinessInput): Promise<Business>
  update(id: string, input: UpdateBusinessInput): Promise<Business>
  delete(id: string): Promise<void>
}
