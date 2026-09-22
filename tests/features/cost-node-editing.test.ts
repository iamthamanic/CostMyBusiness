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
  templateId: 'custom',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function byKey(model: ReturnType<typeof buildProductModel>, key: string) {
  return model.nodes.find((n) => n.key === key)
}

describe('cost node editing mutations', () => {
  it('recalculates when driver inputs change', () => {
    const model = buildProductModel(product)
    const ops = byKey(model, 'ops_labor')!
    const before = evaluate(model).results[ops.id]
    expect(before?.value.status).toBe('ok')

    const updated = updateNodeInputs(model, ops.id, { rate: 80, hoursPerOrder: 0.5 })
    const after = evaluate(updated).results[ops.id]
    expect(after?.value.status).toBe('ok')
    if (after?.value.status === 'ok' && before?.value.status === 'ok') {
      expect(after.value.perUnit).toBe(40)
      expect(after.value.perUnit).not.toBe(before.value.perUnit)
    }
  })

  it('removes optional cost without touching other structure', () => {
    const model = buildProductModel(product)
    const ops = byKey(model, 'ops_labor')!
    const removed = removeNode(model, ops.id)
    expect(removed.nodes.find((n) => n.id === ops.id)).toBeUndefined()
    expect(removed.nodes.find((n) => n.key === 'revenue')).toBeTruthy()
    expect(removed.edges.every((e) => e.sourceNodeId !== ops.id)).toBe(true)
  })

  it('duplicates and adds cost nodes into contribution', () => {
    let model = buildProductModel(product)
    const ops = byKey(model, 'ops_labor')!
    model = duplicateNode(model, ops.id)
    expect(model.nodes.filter((n) => n.kind === 'cost')).toHaveLength(2)
    model = addCostNode(model, { label: 'Extra', inputs: { rate: 5 } })
    expect(model.nodes.some((n) => n.label === 'Extra')).toBe(true)
    const contribution = byKey(model, 'contribution')!
    const result = evaluate(model)
    expect(result.results[contribution.id]?.value.status).toBe('ok')
  })
})
