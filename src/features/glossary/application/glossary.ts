/**
 * Glossary domain types and loaders for shipped terms.
 * Location: src/features/glossary/application/glossary.ts
 */
import { z } from 'zod'
import glossaryJson from '@/data/glossary/terms.json'

export const GlossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  fullName: z.string().min(1),
  shortDefinition: z.string().min(1),
  definition: z.string().min(1),
  formulaDescription: z.string().optional(),
  example: z.string().optional(),
  category: z.string().min(1),
  related: z.array(z.string()).default([]),
})

export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>

const GlossaryFileSchema = z.object({
  version: z.number(),
  terms: z.array(GlossaryTermSchema),
})

const parsed = GlossaryFileSchema.parse(glossaryJson)

export function listGlossaryTerms(): GlossaryTerm[] {
  return parsed.terms
}

export function getGlossaryTerm(id: string): GlossaryTerm | null {
  return parsed.terms.find((t) => t.id === id) ?? null
}
