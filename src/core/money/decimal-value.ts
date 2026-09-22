/**
 * Pure decimal value boundary — hides IEEE floats from financial math.
 * Location: src/core/money/decimal-value.ts
 */
import Decimal from 'decimal.js'

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
})

export type DecimalInput = string | number | Decimal

export function toDecimal(value: DecimalInput): Decimal {
  if (value instanceof Decimal) {
    return value
  }
  return new Decimal(value)
}

export function roundForDisplay(value: DecimalInput, decimalPlaces = 2): Decimal {
  return toDecimal(value).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
}

export function roundInternal(value: DecimalInput, decimalPlaces = 8): Decimal {
  return toDecimal(value).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
}

export { Decimal }
