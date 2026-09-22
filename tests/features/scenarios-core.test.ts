import { describe, expect, it } from 'vitest'
import { createLocalRepositories } from '@/features/businesses'
import {
  normalizePlanningQuantity,
  removeOverride,
  resolveContext,
  setOverride,
  ScenarioCycleError,
  wouldCreateCycle,
  type ProductPlanningState,
} from '@/features/scenarios'
import type { StorageLike } from '@/shared/infrastructure/local-store'

function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

function baseState(overrides: Partial<ProductPlanningState> = {}): ProductPlanningState {
  return {
    productId: 'prd_1',
    period: 'Month',
    activeContextId: 'actual',
    actualValues: { 'funnel.cvr': 0.1, 'node.price': 50 },
    budgetValues: { 'funnel.cvr': 0.12, 'node.price': 55 },
    scenarios: [
      {
        id: 'scn_1',
        name: 'CVR +10%',
        base: 'actual',
        overrides: { 'funnel.cvr': 0.11 },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('scenario resolve', () => {
  it('switches context without mutating other contexts', () => {
    const state = baseState()
    const actual = resolveContext(state, 'actual')
    const budget = resolveContext(state, 'budget')
    const scenario = resolveContext(state, 'scn_1')

    expect(actual.values['funnel.cvr']).toBe(0.1)
    expect(budget.values['funnel.cvr']).toBe(0.12)
    expect(scenario.values['funnel.cvr']).toBe(0.11)
    expect(scenario.values['node.price']).toBe(50)
    // originals untouched
    expect(state.actualValues['funnel.cvr']).toBe(0.1)
    expect(state.budgetValues['funnel.cvr']).toBe(0.12)
  })

  it('stores sparse overrides only and restores inherit on remove', () => {
    let state = baseState()
    expect(Object.keys(state.scenarios[0]!.overrides)).toEqual(['funnel.cvr'])
    state = removeOverride(state, 'scn_1', 'funnel.cvr')
    expect(state.scenarios[0]!.overrides).toEqual({})
    const resolved = resolveContext(state, 'scn_1')
    expect(resolved.values['funnel.cvr']).toBe(0.1)
  })

  it('flags orphan overrides and excludes them', () => {
    const state = baseState({
      scenarios: [
        {
          id: 'scn_1',
          name: 'Orphan',
          base: 'actual',
          overrides: { 'funnel.cvr': 0.2, 'unknown.path': 99 },
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    const resolved = resolveContext(state, 'scn_1')
    expect(resolved.values['unknown.path']).toBeUndefined()
    expect(resolved.orphans.some((o) => o.key === 'unknown.path')).toBe(true)
    expect(resolved.values['funnel.cvr']).toBe(0.2)
  })

  it('detects scenario inheritance cycles', () => {
    const state = baseState({
      scenarios: [
        {
          id: 'scn_a',
          name: 'A',
          base: 'scn_b',
          overrides: {},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'scn_b',
          name: 'B',
          base: 'scn_a',
          overrides: {},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    expect(wouldCreateCycle(state, 'scn_c', 'scn_a')).toBe(true)
    expect(() => resolveContext(state, 'scn_a')).toThrow(ScenarioCycleError)
  })

  it('normalizes period quantities via shared period rules', () => {
    expect(
      normalizePlanningQuantity({
        quantity: 100,
        fromBasis: 'per_month',
        targetPeriod: 'Year',
      }),
    ).toBeCloseTo((100 / 30) * 365, 8)
  })
})

describe('planning repository', () => {
  it('defaults period to Month and keeps bases intact when creating scenarios', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({ businessId: biz.id, name: 'P' })
    let state = await repos.planning.getForProduct(product.id)
    expect(state.period).toBe('Month')

    state = await repos.planning.setBaseValue(product.id, 'actual', 'funnel.cvr', 0.1)
    state = await repos.planning.setBaseValue(product.id, 'budget', 'funnel.cvr', 0.15)
    const { state: withScenario } = await repos.planning.createScenario(product.id, {
      name: 'CVR +10%',
      base: 'actual',
      overrides: { 'funnel.cvr': 0.11 },
    })
    expect(withScenario.actualValues['funnel.cvr']).toBe(0.1)
    expect(withScenario.budgetValues['funnel.cvr']).toBe(0.15)
    const resolved = resolveContext(withScenario, withScenario.activeContextId)
    expect(resolved.values['funnel.cvr']).toBe(0.11)

    const afterRemove = await repos.planning.removeScenarioOverride(
      product.id,
      withScenario.scenarios[0]!.id,
      'funnel.cvr',
    )
    expect(resolveContext(afterRemove, afterRemove.scenarios[0]!.id).values['funnel.cvr']).toBe(0.1)
  })
})

describe('setOverride helper', () => {
  it('adds a single override key', () => {
    const next = setOverride(baseState({ scenarios: [{ ...baseState().scenarios[0]!, overrides: {} }] }), 'scn_1', 'funnel.cvr', 0.2)
    expect(next.scenarios[0]!.overrides).toEqual({ 'funnel.cvr': 0.2 })
  })
})
