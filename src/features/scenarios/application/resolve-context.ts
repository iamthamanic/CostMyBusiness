/**
 * Resolve sparse scenario overrides against Actual/Budget bases; detect cycles/orphans.
 * Location: src/features/scenarios/application/resolve-context.ts
 */
import type { PeriodType } from '@/core/periods'
import { normalizeToPeriod, type NativeBasis } from '@/core/periods'
import {
  ScenarioCycleError,
  type ProductPlanningState,
  type Scenario,
} from '../domain/planning'

export type ResolvedEntry = {
  key: string
  value: number | null
  source: 'actual' | 'budget' | 'scenario' | 'missing'
  orphan: boolean
  scenarioId?: string
}

export type ResolveResult = {
  values: Record<string, number>
  entries: ResolvedEntry[]
  orphans: ResolvedEntry[]
}

function walkBaseChain(
  state: ProductPlanningState,
  startId: string,
): { chain: string[]; scenario?: Scenario } {
  const chain: string[] = []
  let current = startId
  const seen = new Set<string>()

  while (current !== 'actual' && current !== 'budget') {
    if (seen.has(current)) {
      throw new ScenarioCycleError(
        'Szenario-Vererbung bildet einen Zyklus und wurde abgelehnt.',
      )
    }
    seen.add(current)
    chain.push(current)
    const scenario = state.scenarios.find((s) => s.id === current)
    if (!scenario) {
      throw new ScenarioCycleError(`Szenario „${current}“ wurde nicht gefunden.`)
    }
    current = scenario.base
  }
  chain.push(current)
  return { chain }
}

/**
 * Detect whether attaching `base` under `scenarioId` would create a cycle.
 */
export function wouldCreateCycle(
  state: ProductPlanningState,
  scenarioId: string,
  base: string,
): boolean {
  if (base === 'actual' || base === 'budget') return false
  let current = base
  const seen = new Set<string>([scenarioId])
  while (current !== 'actual' && current !== 'budget') {
    if (seen.has(current)) return true
    seen.add(current)
    const next = state.scenarios.find((s) => s.id === current)
    if (!next) return false
    current = next.base
  }
  return false
}

/**
 * Known keys come from actual ∪ budget ∪ explicit catalog.
 * Overrides for unknown keys are orphans (flagged, excluded).
 */
export function resolveContext(
  state: ProductPlanningState,
  contextId: string = state.activeContextId,
  knownKeys?: Set<string>,
): ResolveResult {
  const catalog =
    knownKeys ??
    new Set([
      ...Object.keys(state.actualValues),
      ...Object.keys(state.budgetValues),
      ...state.scenarios.flatMap((s) => Object.keys(s.overrides)),
    ])

  // Seed catalog from actual+budget only for orphan detection when knownKeys omitted:
  const baseCatalog = knownKeys ?? new Set([
    ...Object.keys(state.actualValues),
    ...Object.keys(state.budgetValues),
  ])

  const { chain } = walkBaseChain(state, contextId)
  // chain ends with actual|budget; preceding are scenario ids from leaf to root
  const scenarioIds = chain.slice(0, -1)
  const root = chain[chain.length - 1] as 'actual' | 'budget'

  const layered: Array<{ id: string; values: Record<string, number> }> = []
  layered.push({
    id: root,
    values: root === 'actual' ? state.actualValues : state.budgetValues,
  })
  // Apply scenario overrides from base→leaf so leaf wins
  for (const id of [...scenarioIds].reverse()) {
    const scenario = state.scenarios.find((s) => s.id === id)!
    layered.push({ id, values: scenario.overrides })
  }

  const entries: ResolvedEntry[] = []
  const values: Record<string, number> = {}
  const orphans: ResolvedEntry[] = []

  const allKeys = new Set<string>([...catalog, ...baseCatalog])
  for (const layer of layered) {
    for (const key of Object.keys(layer.values)) allKeys.add(key)
  }

  for (const key of allKeys) {
    let resolved: ResolvedEntry = {
      key,
      value: null,
      source: 'missing',
      orphan: false,
    }

    for (const layer of layered) {
      if (!(key in layer.values)) continue
      const raw = layer.values[key]!
      const isScenario = layer.id !== 'actual' && layer.id !== 'budget'
      const orphan = isScenario && !baseCatalog.has(key)
      if (orphan) {
        const entry: ResolvedEntry = {
          key,
          value: raw,
          source: 'scenario',
          orphan: true,
          scenarioId: layer.id,
        }
        // Keep last orphan sighting but do not put into values
        resolved = entry
        continue
      }
      resolved = {
        key,
        value: raw,
        source: layer.id === 'actual' || layer.id === 'budget' ? layer.id : 'scenario',
        orphan: false,
        scenarioId: isScenario ? layer.id : undefined,
      }
    }

    entries.push(resolved)
    if (resolved.orphan) {
      orphans.push(resolved)
    } else if (resolved.value !== null) {
      values[key] = resolved.value
    }
  }

  return { values, entries, orphans }
}

export function setOverride(
  state: ProductPlanningState,
  scenarioId: string,
  key: string,
  value: number,
): ProductPlanningState {
  return {
    ...state,
    scenarios: state.scenarios.map((s) =>
      s.id === scenarioId
        ? {
            ...s,
            overrides: { ...s.overrides, [key]: value },
            updatedAt: new Date().toISOString(),
          }
        : s,
    ),
    updatedAt: new Date().toISOString(),
  }
}

export function removeOverride(
  state: ProductPlanningState,
  scenarioId: string,
  key: string,
): ProductPlanningState {
  return {
    ...state,
    scenarios: state.scenarios.map((s) => {
      if (s.id !== scenarioId) return s
      const rest = { ...s.overrides }
      delete rest[key]
      return { ...s, overrides: rest, updatedAt: new Date().toISOString() }
    }),
    updatedAt: new Date().toISOString(),
  }
}

export function normalizePlanningQuantity(args: {
  quantity: number
  fromBasis: NativeBasis
  targetPeriod: PeriodType
  hoursInTargetPeriod?: number
  volumeInTargetPeriod?: number
}): number {
  return normalizeToPeriod(args)
}
