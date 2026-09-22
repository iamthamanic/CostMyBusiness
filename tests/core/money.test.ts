import { describe, expect, it } from 'vitest'
import { CurrencyMismatchError, DEFAULT_CURRENCY, Money } from '@/core/money'
import { Decimal } from '@/core/money/decimal-value'

describe('Money', () => {
  it('defaults currency to EUR and hides float drift', () => {
    const money = Money.of('0.1').add(Money.of('0.2'))
    expect(money.currency).toBe(DEFAULT_CURRENCY)
    expect(money.displayAmount()).toBe('0.30')
    expect(money.amount).toBeInstanceOf(Decimal)
  })

  it('rounds display HALF_UP to 2 dp', () => {
    expect(Money.of('1.005').displayAmount()).toBe('1.01')
    expect(Money.of('1.004').displayAmount()).toBe('1.00')
  })

  it('rejects mixed-currency aggregation', () => {
    expect(() => Money.of(10, 'EUR').add(Money.of(5, 'USD'))).toThrow(CurrencyMismatchError)
  })
})
