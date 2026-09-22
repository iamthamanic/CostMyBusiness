/**
 * Scenarios feature public API.
 * Location: src/features/scenarios/index.ts
 */
export {
  normalizePlanningQuantity,
  removeOverride,
  resolveContext,
  setOverride,
  wouldCreateCycle,
  type ResolveResult,
  type ResolvedEntry,
} from './application/resolve-context'
export type { PlanningRepository } from './application/planning-repository'
export {
  ProductPlanningStateSchema,
  ScenarioCycleError,
  ScenarioSchema,
  type ProductPlanningState,
  type Scenario,
} from './domain/planning'
export { ContextPeriodChrome } from './ui/ContextPeriodChrome'
