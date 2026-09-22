/**
 * Business domain types and Zod schemas.
 * Location: src/features/businesses/domain/business.ts
 */
import { z } from 'zod'

export const BusinessSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  defaultCurrency: z.string().length(3).default('EUR'),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type Business = z.infer<typeof BusinessSchema>

export type CreateBusinessInput = {
  workspaceId: string
  name: string
  defaultCurrency?: string
}

export type UpdateBusinessInput = {
  name?: string
  defaultCurrency?: string
}
