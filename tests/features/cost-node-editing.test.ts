import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { buildProductModel } from '@/features/cost-graph/application/build-product-model'
import {
  addCostNode,
  duplicateNode,
  removeNode,
  updateNodeInputs,
} from '@/features/cost-graph/application/mutate-model'
import type { Product } from '@/features/products'

const product: Product = {
  id: 'prd_1',
  businessId: 'biz_1',
  name: 'Test',
  currency: 'EUR',
  price: 50,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('cost node editing mutations', () => {
  it('recalculates when driver inputs change', () => {
    const model = buildProductModel(product)
    const before = evaluate(model).results['n-ops']
    expect(before?.value.status).toBe('ok')

    const updated = updateNodeInputs(model, 'n-ops', { rate: 80, hoursPerOrder: 0.5 })
    const after = evaluate(updated).results['n-ops']
    expect(after?.value.status).toBe('ok')
    if (after?.value.status === 'ok' && before?.value.status === 'ok') {
      expect(after.value.perUnit).toBe(40)
      expect(after.value.perUnit).not.toBe(before.value.perUnit)
    }
  })

  it('removes optional cost without touching other structure', () => {
    const model = buildProductModel(product)
    const removed = removeNode(model, 'n-ops')
    expect(removed.nodes.find((n) => n.id === 'n-ops')).toBeUndefined()
    expect(removed.nodes.find((n) => n.key === 'revenue')).toBeTruthy()
    expect(removed.edges.every((e) => e.sourceNodeId !== 'n-ops')).toBe(true)
  })

  it('duplicates and adds cost nodes into contribution', () => {
    let model = buildProductModel(product)
    model = duplicateNode(model, 'n-ops')
    expect(model.nodes.filter((n) => n.kind === 'cost')).toHaveLength(2)
    model = addCostNode(model, { label: 'Extra', inputs: { rate: 5 } })
    expect(model.nodes.some((n) => n.label === 'Extra')).toBe(true)
    const result = evaluate(model)
    expect(result.results['n-contribution']?.value.status).toBe('ok')
  })
})
