/**
 * Scenario / planning context domain types.
 * Location: src/features/scenarios/domain/planning.ts
 */
import { z } from 'zod'
import { PERIOD_TYPES } from '@/core/periods'

export const ContextKindSchema = z.enum(['actual', 'budget', 'scenario'])
export type ContextKind = z.infer<typeof ContextKindSchema>

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Inherit from actual, budget, or another scenario id. */
  base: z.string().min(1),
  /** Sparse overrides only — keys are stable value paths (e.g. node.ops_labor.inputs.rate). */
  overrides: z.record(z.string(), z.number().finite()),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type Scenario = z.infer<typeof ScenarioSchema>

export const ProductPlanningStateSchema = z.object({
  productId: z.string().min(1),
  period: z.enum(PERIOD_TYPES).default('Month'),
  /** 'actual' | 'budget' | scenario id */
  activeContextId: z.string().min(1).default('actual'),
  actualValues: z.record(z.string(), z.number().finite()).default({}),
  budgetValues: z.record(z.string(), z.number().finite()).default({}),
  scenarios: z.array(ScenarioSchema).default([]),
  updatedAt: z.string().min(1),
})

export type ProductPlanningState = z.infer<typeof ProductPlanningStateSchema>

export class ScenarioCycleError extends Error {
  readonly code = 'SCENARIO_CYCLE' as const
  constructor(readonly messageDe: string) {
    super(messageDe)
    this.name = 'ScenarioCycleError'
  }
}
