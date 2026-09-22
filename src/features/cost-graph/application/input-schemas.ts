/**
 * Declarative input schemas per cost behavior (templates may extend later).
 * Location: src/features/cost-graph/application/input-schemas.ts
 */
import type { CostBehavior } from '@/core/model'

export type InputFieldDef = {
  id: string
  labelDe: string
  unitDe: string
  required: boolean
  /** When true, field is shown read-only (derived). */
  derived?: boolean
}

export type CostInputSchema = {
  behavior: CostBehavior
  fields: InputFieldDef[]
  /** Short German derivation template; `{id}` placeholders. */
  derivationDe: string
}

const SCHEMAS: Record<CostBehavior, CostInputSchema> = {
  per_hour: {
    behavior: 'per_hour',
    fields: [
      { id: 'rate', labelDe: 'Vollkosten / Stunde', unitDe: 'EUR/h', required: true },
      { id: 'hoursPerStop', labelDe: 'Stunden / Stopp', unitDe: 'h', required: false },
      { id: 'stopsPerOrder', labelDe: 'Stopps / Auftrag', unitDe: 'Stk', required: false },
      { id: 'hoursPerOrder', labelDe: 'Stunden / Auftrag', unitDe: 'h', required: false },
    ],
    derivationDe: 'rate × Stunden/Auftrag',
  },
  per_km: {
    behavior: 'per_km',
    fields: [
      { id: 'rate', labelDe: 'Kosten / km', unitDe: 'EUR/km', required: true },
      { id: 'quantity', labelDe: 'km / Auftrag', unitDe: 'km', required: false },
    ],
    derivationDe: 'rate × km',
  },
  per_stop: {
    behavior: 'per_stop',
    fields: [
      { id: 'rate', labelDe: 'Kosten / Stopp', unitDe: 'EUR', required: true },
      { id: 'quantity', labelDe: 'Stopps / Auftrag', unitDe: 'Stk', required: false },
    ],
    derivationDe: 'rate × Stopps',
  },
  per_order: {
    behavior: 'per_order',
    fields: [{ id: 'rate', labelDe: 'Kosten / Auftrag', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Auftrag',
  },
  per_unit: {
    behavior: 'per_unit',
    fields: [{ id: 'rate', labelDe: 'Kosten / Einheit', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Einheit',
  },
  per_customer: {
    behavior: 'per_customer',
    fields: [{ id: 'rate', labelDe: 'Kosten / Kunde', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Kunde',
  },
  per_employee: {
    behavior: 'per_employee',
    fields: [{ id: 'rate', labelDe: 'Kosten / MA', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / MA',
  },
  per_transaction: {
    behavior: 'per_transaction',
    fields: [{ id: 'rate', labelDe: 'Kosten / Transaktion', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Transaktion',
  },
  per_click: {
    behavior: 'per_click',
    fields: [{ id: 'rate', labelDe: 'Kosten / Klick', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Klick',
  },
  per_api_call: {
    behavior: 'per_api_call',
    fields: [{ id: 'rate', labelDe: 'Kosten / API-Call', unitDe: 'EUR', required: true }],
    derivationDe: 'rate / Call',
  },
  fixed_period: {
    behavior: 'fixed_period',
    fields: [
      { id: 'amount', labelDe: 'Betrag / Periode', unitDe: 'EUR', required: true },
    ],
    derivationDe: 'amount / Periode',
  },
  percentage_revenue: {
    behavior: 'percentage_revenue',
    fields: [
      { id: 'percentage', labelDe: 'Prozentsatz', unitDe: '%', required: true },
      { id: 'revenuePerUnit', labelDe: 'Umsatzbasis / Einh.', unitDe: 'EUR', required: true },
    ],
    derivationDe: 'Umsatz × %',
  },
  custom_formula: {
    behavior: 'custom_formula',
    fields: [
      { id: 'rate', labelDe: 'Fallback-Satz', unitDe: 'EUR', required: true },
    ],
    derivationDe: 'Formel / Fallback',
  },
}

export function inputSchemaFor(behavior: CostBehavior | undefined): CostInputSchema {
  return SCHEMAS[behavior ?? 'per_order']
}

/** Human-readable derivation line from current inputs. */
export function formatDerivation(behavior: CostBehavior | undefined, inputs: Record<string, number>): string {
  const schema = inputSchemaFor(behavior)
  if (behavior === 'per_hour') {
    const rate = inputs.rate
    if (rate === undefined) return '—'
    if (inputs.hoursPerStop !== undefined && inputs.stopsPerOrder !== undefined) {
      const hours = inputs.hoursPerStop * inputs.stopsPerOrder
      return `${rate} × ${inputs.hoursPerStop} × ${inputs.stopsPerOrder} = ${(rate * hours).toFixed(2)}`
    }
    if (inputs.hoursPerOrder !== undefined) {
      return `${rate} × ${inputs.hoursPerOrder} = ${(rate * inputs.hoursPerOrder).toFixed(2)}`
    }
    return schema.derivationDe
  }
  if (behavior === 'per_km' || behavior === 'per_stop') {
    const rate = inputs.rate
    const qty = inputs.quantity
    if (rate === undefined) return '—'
    if (qty === undefined) return `${rate} × Menge`
    return `${rate} × ${qty} = ${(rate * qty).toFixed(2)}`
  }
  if (behavior === 'fixed_period') {
    return inputs.amount !== undefined ? `${inputs.amount} / Periode` : schema.derivationDe
  }
  if (behavior === 'percentage_revenue') {
    const p = inputs.percentage
    const r = inputs.revenuePerUnit
    if (p === undefined || r === undefined) return schema.derivationDe
    return `${r} × ${p}% = ${((r * p) / 100).toFixed(2)}`
  }
  if (inputs.rate !== undefined) return `${inputs.rate}`
  return schema.derivationDe
}
