/**
 * Planning/scenario repository port.
 * Location: src/features/scenarios/application/planning-repository.ts
 */
import type { PeriodType } from '@/core/periods'
import type { ProductPlanningState, Scenario } from '../domain/planning'

export type PlanningRepository = {
  getForProduct(productId: string): Promise<ProductPlanningState>
  save(state: ProductPlanningState): Promise<ProductPlanningState>
  setActiveContext(productId: string, contextId: string): Promise<ProductPlanningState>
  setPeriod(productId: string, period: PeriodType): Promise<ProductPlanningState>
  setBaseValue(
    productId: string,
    context: 'actual' | 'budget',
    key: string,
    value: number,
  ): Promise<ProductPlanningState>
  createScenario(
    productId: string,
    input: { name: string; base: string; overrides?: Record<string, number> },
  ): Promise<{ state: ProductPlanningState; scenario: Scenario }>
  setScenarioOverride(
    productId: string,
    scenarioId: string,
    key: string,
    value: number,
  ): Promise<ProductPlanningState>
  removeScenarioOverride(
    productId: string,
    scenarioId: string,
    key: string,
  ): Promise<ProductPlanningState>
  deleteScenario(productId: string, scenarioId: string): Promise<ProductPlanningState>
}
