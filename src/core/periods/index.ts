/**
 * Period types and native-basis normalization rules.
 * Location: src/core/periods/period.ts
 */

export const PERIOD_TYPES = ['Day', 'Week', 'Month', 'Quarter', 'Year'] as const
export type PeriodType = (typeof PERIOD_TYPES)[number]

export const DEFAULT_PERIOD: PeriodType = 'Month'

export type NativeBasis =
  | 'per_day'
  | 'per_week'
  | 'per_month'
  | 'per_quarter'
  | 'per_year'
  | 'per_hour'
  | 'per_order'
  | 'per_unit'
  | 'fixed_period'
  | 'annual_fixed'

export class PeriodConversionError extends Error {
  readonly code = 'PERIOD_CONVERSION' as const

  constructor(message: string) {
    super(message)
    this.name = 'PeriodConversionError'
  }
}

const DAYS_PER: Record<PeriodType, number> = {
  Day: 1,
  Week: 7,
  Month: 30,
  Quarter: 90,
  Year: 365,
}

/** Map native time bases that support calendar normalization. */
const BASIS_TO_PERIOD: Partial<Record<NativeBasis, PeriodType>> = {
  per_day: 'Day',
  per_week: 'Week',
  per_month: 'Month',
  per_quarter: 'Quarter',
  per_year: 'Year',
  annual_fixed: 'Year',
}

export function isPeriodType(value: string): value is PeriodType {
  return (PERIOD_TYPES as readonly string[]).includes(value)
}

export function defaultPeriod(): PeriodType {
  return DEFAULT_PERIOD
}

/**
 * Convert a quantity expressed in `fromBasis` into a total for `targetPeriod`.
 * Refuses naive conversion for hourly / per-order / per-unit without an explicit rule.
 */
export function normalizeToPeriod(args: {
  quantity: number
  fromBasis: NativeBasis
  targetPeriod: PeriodType
  /** Required when fromBasis is per_hour: hours contained in the target period. */
  hoursInTargetPeriod?: number
  /** Required when fromBasis is per_order or per_unit: count in the target period. */
  volumeInTargetPeriod?: number
}): number {
  const { quantity, fromBasis, targetPeriod } = args

  if (fromBasis === 'per_hour') {
    if (args.hoursInTargetPeriod === undefined) {
      throw new PeriodConversionError(
        'Cannot convert per_hour without hoursInTargetPeriod (refuses naive divide)',
      )
    }
    return quantity * args.hoursInTargetPeriod
  }

  if (fromBasis === 'per_order' || fromBasis === 'per_unit') {
    if (args.volumeInTargetPeriod === undefined) {
      throw new PeriodConversionError(
        `Cannot convert ${fromBasis} without volumeInTargetPeriod (refuses naive divide)`,
      )
    }
    return quantity * args.volumeInTargetPeriod
  }

  if (fromBasis === 'fixed_period') {
    return quantity
  }

  const sourcePeriod = BASIS_TO_PERIOD[fromBasis]
  if (!sourcePeriod) {
    throw new PeriodConversionError(`Unsupported native basis: ${fromBasis}`)
  }

  const sourceDays = DAYS_PER[sourcePeriod]
  const targetDays = DAYS_PER[targetPeriod]
  return (quantity / sourceDays) * targetDays
}
