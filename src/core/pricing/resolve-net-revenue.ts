/**
 * Product pricing → economic net revenue (VAT is not a cost).
 * Location: src/core/pricing/resolve-net-revenue.ts
 */
import { roundForDisplay, roundInternal, toDecimal } from '@/core/money/decimal-value'

export type PriceKind = 'gross' | 'net'

export type PricingBasis = 'per_order' | 'per_unit' | 'per_customer' | 'per_month'

export type ProductPricingInput = {
  sellingPrice: number
  priceKind: PriceKind
  /** VAT/tax as percent points, e.g. 19 for 19%. */
  taxRatePercent: number
  pricingBasis: PricingBasis
  currency: string
}

export type NetRevenueResult =
  | {
      status: 'ok'
      netRevenue: number
      grossRevenue: number
      taxAmount: number
      taxRatePercent: number
      priceKind: PriceKind
      pricingBasis: PricingBasis
      currency: string
    }
  | {
      status: 'unresolved'
      reason: 'invalid_price' | 'invalid_tax_rate'
      messageDe: string
    }

/**
 * Resolve economic net revenue from product pricing.
 * Gross → net: sellingPrice / (1 + taxRatePercent/100).
 * Net → net: sellingPrice unchanged; gross = net * (1 + rate).
 */
export function resolveNetRevenue(input: ProductPricingInput): NetRevenueResult {
  const { sellingPrice, priceKind, taxRatePercent, pricingBasis, currency } = input

  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
    return {
      status: 'unresolved',
      reason: 'invalid_price',
      messageDe: 'Verkaufspreis muss eine endliche, nicht-negative Zahl sein.',
    }
  }

  if (!Number.isFinite(taxRatePercent) || taxRatePercent < 0 || taxRatePercent >= 100) {
    return {
      status: 'unresolved',
      reason: 'invalid_tax_rate',
      messageDe: 'USt-Satz muss zwischen 0 und unter 100 liegen.',
    }
  }

  const price = toDecimal(sellingPrice)
  const factor = toDecimal(1).plus(toDecimal(taxRatePercent).div(100))

  if (priceKind === 'gross') {
    const net = roundInternal(price.div(factor))
    const netDisplay = Number(roundForDisplay(net, 2).toFixed(2))
    const grossDisplay = Number(roundForDisplay(price, 2).toFixed(2))
    const taxAmount = Number(roundForDisplay(price.minus(net), 2).toFixed(2))
    return {
      status: 'ok',
      netRevenue: netDisplay,
      grossRevenue: grossDisplay,
      taxAmount,
      taxRatePercent,
      priceKind,
      pricingBasis,
      currency,
    }
  }

  const net = roundInternal(price)
  const gross = roundInternal(net.times(factor))
  const netDisplay = Number(roundForDisplay(net, 2).toFixed(2))
  const grossDisplay = Number(roundForDisplay(gross, 2).toFixed(2))
  const taxAmount = Number(roundForDisplay(gross.minus(net), 2).toFixed(2))
  return {
    status: 'ok',
    netRevenue: netDisplay,
    grossRevenue: grossDisplay,
    taxAmount,
    taxRatePercent,
    priceKind,
    pricingBasis,
    currency,
  }
}
