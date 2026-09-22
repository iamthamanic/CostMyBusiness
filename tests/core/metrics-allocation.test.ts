import { describe, expect, it } from 'vitest'
import { allocate, breakEvenUnits, combineDirectAndAllocated } from '@/core/allocation'
import { listMetricIds } from '@/core/metrics'

describe('metrics and allocation', () => {
  it('exposes stable metric ids', () => {
    const ids = listMetricIds()
    expect(ids).toContain('revenue')
    expect(ids).toContain('cac')
    expect(ids).toContain('break_even_units')
    expect(ids).toContain('fully_loaded_profit')
  })

  it('keeps direct and allocated separately inspectable', () => {
    const allocated = allocate({
      poolAmount: 1000,
      strategy: 'per_order',
      sourcePoolId: 'hr-pool',
      driverQuantity: 10,
    })
    expect(allocated.status).toBe('ok')
    if (allocated.status !== 'ok') return
    const breakdown = combineDirectAndAllocated(200, allocated.allocatedAmount)
    expect(breakdown.direct).toBe(200)
    expect(breakdown.allocated).toBe(100)
    expect(breakdown.fullyLoaded).toBe(300)
    expect(allocated.provenance.rule).toBe('allocated')
  })

  it('unresolves zero driver instead of lying with zero profit', () => {
    const result = allocate({
      poolAmount: 500,
      strategy: 'per_unit',
      sourcePoolId: 'overhead',
      driverQuantity: 0,
    })
    expect(result.status).toBe('unresolved')
  })

  it('computes break-even when inputs valid', () => {
    const result = breakEvenUnits({ fixedCost: 1000, contributionPerUnit: 25 })
    expect(result).toMatchObject({ status: 'ok', units: 40, formula: 'fixedCost / contributionPerUnit' })
  })
})
