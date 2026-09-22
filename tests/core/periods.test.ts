import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PERIOD,
  PeriodConversionError,
  defaultPeriod,
  normalizeToPeriod,
} from '@/core/periods'

describe('periods', () => {
  it('defaults to Month', () => {
    expect(defaultPeriod()).toBe('Month')
    expect(DEFAULT_PERIOD).toBe('Month')
  })

  it('normalizes monthly fixed into year via day factors', () => {
    const yearly = normalizeToPeriod({
      quantity: 100,
      fromBasis: 'per_month',
      targetPeriod: 'Year',
    })
    // 100 / 30 * 365
    expect(yearly).toBeCloseTo((100 / 30) * 365, 8)
  })

  it('refuses naive per_hour conversion without hoursInTargetPeriod', () => {
    expect(() =>
      normalizeToPeriod({
        quantity: 50,
        fromBasis: 'per_hour',
        targetPeriod: 'Month',
      }),
    ).toThrow(PeriodConversionError)
  })

  it('converts per_hour when hours provided', () => {
    expect(
      normalizeToPeriod({
        quantity: 50,
        fromBasis: 'per_hour',
        targetPeriod: 'Month',
        hoursInTargetPeriod: 160,
      }),
    ).toBe(8000)
  })
})
