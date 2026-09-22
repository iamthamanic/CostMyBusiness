import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { formatDerivation, inputSchemaFor } from '@/features/cost-graph/application/input-schemas'
import { updateNodeInputs } from '@/features/cost-graph/application/mutate-model'
import { buildProductModel } from '@/features/cost-graph'
import { ProductSchema } from '@/features/products'

describe('inline cost calculator nodes', () => {
  it('exposes schema fields for per_hour without a dedicated React component', () => {
    const schema = inputSchemaFor('per_hour')
    expect(schema.fields.some((f) => f.id === 'rate')).toBe(true)
    expect(schema.fields.some((f) => f.id === 'hoursPerStop')).toBe(true)
  })

  it('updates Fahrer-like cost and department cascade from inline inputs', () => {
    const product = ProductSchema.parse({
      id: 'prd_1',
      businessId: 'biz_1',
      name: 'HZ',
      currency: 'EUR',
      sellingPrice: 89,
      priceKind: 'gross',
      taxRatePercent: 19,
      pricingBasis: 'per_order',
      templateId: 'traffic-safety',
      templateVersion: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    let model = buildProductModel(product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')
    expect(driver).toBeTruthy()
    model = updateNodeInputs(model, driver!.id, {
      rate: 28,
      hoursPerStop: 0.3,
      stopsPerOrder: 2,
    })
    const evaluation = evaluate(model)
    const result = evaluation.results[driver!.id]
    expect(result?.value.status).toBe('ok')
    if (result?.value.status === 'ok') {
      expect(result.value.perUnit).toBeCloseTo(16.8, 5)
    }
    const ops = model.nodes.find((n) => n.key === 'g_operations')
    const opsResult = ops ? evaluation.results[ops.id] : undefined
    expect(opsResult?.value.status).toBe('ok')
    expect(formatDerivation('per_hour', { rate: 28, hoursPerStop: 0.3, stopsPerOrder: 2 })).toMatch(
      /16\.80/,
    )
  })

  it('surfaces unresolved German message instead of silent zero', () => {
    const product = ProductSchema.parse({
      id: 'prd_2',
      businessId: 'biz_1',
      name: 'HZ',
      currency: 'EUR',
      sellingPrice: 89,
      priceKind: 'gross',
      taxRatePercent: 19,
      pricingBasis: 'per_order',
      templateId: 'traffic-safety',
      templateVersion: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    let model = buildProductModel(product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')!
    model = {
      ...model,
      nodes: model.nodes.map((n) =>
        n.id === driver.id ? { ...n, inputs: { rate: 28 } } : n,
      ),
    }
    const evaluation = evaluate(model)
    const result = evaluation.results[driver.id]
    expect(result?.value.status).toBe('unresolved')
    if (result?.value.status === 'unresolved') {
      expect(result.value.message).not.toMatch(/NaN|Infinity/)
      expect(result.value.message.length).toBeGreaterThan(0)
    }
  })
})
