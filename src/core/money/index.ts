/**
 * Money type with explicit ISO 4217 currency and decimal-safe arithmetic.
 * Location: src/core/money/money.ts
 */
import { Decimal, roundForDisplay, roundInternal, toDecimal, type DecimalInput } from './decimal-value'

export type CurrencyCode = string

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR'

export class CurrencyMismatchError extends Error {
  readonly code = 'CURRENCY_MISMATCH' as const

  constructor(
    readonly left: CurrencyCode,
    readonly right: CurrencyCode,
  ) {
    super(`Cannot aggregate mixed currencies: ${left} vs ${right}`)
    this.name = 'CurrencyMismatchError'
  }
}

export type MoneyJSON = {
  amount: string
  currency: CurrencyCode
}

export class Money {
  private constructor(
    readonly amount: Decimal,
    readonly currency: CurrencyCode,
  ) {}

  static of(amount: DecimalInput, currency: CurrencyCode = DEFAULT_CURRENCY): Money {
    return new Money(roundInternal(amount), currency)
  }

  static zero(currency: CurrencyCode = DEFAULT_CURRENCY): Money {
    return Money.of(0, currency)
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return Money.of(this.amount.plus(other.amount), this.currency)
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    return Money.of(this.amount.minus(other.amount), this.currency)
  }

  multiply(factor: DecimalInput): Money {
    return Money.of(this.amount.times(toDecimal(factor)), this.currency)
  }

  divide(divisor: DecimalInput): Money {
    const d = toDecimal(divisor)
    if (d.isZero()) {
      throw new Error('Division by zero in Money.divide')
    }
    return Money.of(this.amount.div(d), this.currency)
  }

  displayAmount(decimalPlaces = 2): string {
    return roundForDisplay(this.amount, decimalPlaces).toFixed(decimalPlaces)
  }

  toJSON(): MoneyJSON {
    return {
      amount: this.amount.toFixed(),
      currency: this.currency,
    }
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency)
    }
  }
}
