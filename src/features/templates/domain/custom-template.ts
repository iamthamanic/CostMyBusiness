/**
 * Owner-scoped custom template domain types.
 * Location: src/features/templates/domain/custom-template.ts
 */
import { z } from 'zod'
import { ShippedTemplateSchema } from './template-schema'

export const CustomTemplateSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive().default(1),
  /** Normalized template definition (same shape as shipped; never mutates shipped JSON). */
  definition: ShippedTemplateSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type CustomTemplate = z.infer<typeof CustomTemplateSchema>

export class DuplicateTemplateNameError extends Error {
  readonly code = 'DUPLICATE_TEMPLATE_NAME' as const
  constructor(readonly messageDe: string) {
    super(messageDe)
    this.name = 'DuplicateTemplateNameError'
  }
}
