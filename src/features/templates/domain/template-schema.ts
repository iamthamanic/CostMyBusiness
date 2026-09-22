/**
 * Zod schemas for versioned shipped industry templates.
 * Location: src/features/templates/domain/template-schema.ts
 */
import { z } from 'zod'

export const TemplateCostBehaviorSchema = z.enum([
  'per_unit',
  'per_order',
  'per_customer',
  'per_employee',
  'per_hour',
  'per_km',
  'per_stop',
  'per_transaction',
  'per_click',
  'per_api_call',
  'percentage_revenue',
  'fixed_period',
  'custom_formula',
])

export const TemplateLayerGuidanceSchema = z.object({
  generalDe: z.string().min(1),
  commonExamplesDe: z.array(z.string()).default([]),
  industryDe: z.string().optional(),
  industryExamplesDe: z.array(z.string()).default([]),
})

export const TemplateLayerSchema = z.object({
  key: z.string().min(1),
  labelDe: z.string().min(1),
  guidance: TemplateLayerGuidanceSchema,
})

export const TemplateNodeSchema = z.object({
  key: z.string().min(1),
  kind: z.enum(['revenue', 'cost', 'driver', 'result', 'group', 'metric']),
  labelDe: z.string().min(1),
  /** When false, node is optional and may be deselected at create time. */
  required: z.boolean().default(false),
  /** Preselected in the create wizard when not required. */
  suggested: z.boolean().default(true),
  layerKey: z.string().optional(),
  costBehavior: TemplateCostBehaviorSchema.optional(),
  inputs: z.record(z.string(), z.number()).default({}),
  formulaRef: z.string().optional(),
  allocation: z
    .object({
      rule: z.enum(['direct', 'allocated']),
      strategy: z.string().optional(),
    })
    .optional(),
})

export const TemplateEdgeSchema = z.object({
  sourceKey: z.string().min(1),
  targetKey: z.string().min(1),
  relation: z.enum(['feeds', 'allocates_to', 'depends_on']).default('feeds'),
})

export const ShippedTemplateSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  industry: z.string().min(1),
  labelDe: z.string().min(1),
  descriptionDe: z.string().min(1),
  defaultVolume: z.number().finite().positive().default(100),
  layers: z.array(TemplateLayerSchema).default([]),
  nodes: z.array(TemplateNodeSchema).min(1),
  edges: z.array(TemplateEdgeSchema).default([]),
})

export type ShippedTemplate = z.infer<typeof ShippedTemplateSchema>
export type TemplateLayer = z.infer<typeof TemplateLayerSchema>
export type TemplateNode = z.infer<typeof TemplateNodeSchema>

export class UnknownTemplateError extends Error {
  readonly code = 'UNKNOWN_TEMPLATE' as const
  constructor(
    readonly templateId: string,
    readonly messageDe: string,
  ) {
    super(messageDe)
    this.name = 'UnknownTemplateError'
  }
}

export class UnsupportedTemplateVersionError extends Error {
  readonly code = 'UNSUPPORTED_TEMPLATE_VERSION' as const
  constructor(
    readonly templateId: string,
    readonly version: number,
    readonly messageDe: string,
  ) {
    super(messageDe)
    this.name = 'UnsupportedTemplateVersionError'
  }
}
