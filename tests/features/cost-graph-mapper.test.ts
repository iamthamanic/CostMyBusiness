import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { buildProductModel } from '@/features/cost-graph/application/build-product-model'
import { mapDomainToFlow } from '@/features/cost-graph/application/map-domain-to-flow'
import type { Product } from '@/features/products'

describe('cost-graph mapper', () => {
  it('maps domain nodes without treating RF as source of truth', () => {
    const product: Product = {
      id: 'prd_1',
      businessId: 'biz_1',
      name: 'Test',
      currency: 'EUR',
      price: 50,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const model = buildProductModel(product)
    const evaluation = evaluate(model)
    const flow = mapDomainToFlow(model, evaluation)

    expect(flow.nodes).toHaveLength(model.nodes.length)
    expect(flow.edges).toHaveLength(model.edges.length)
    expect(flow.nodes.every((n) => n.data.domainNodeId)).toBe(true)
    // Domain model unchanged by mapping
    expect(model.nodes[0]?.id).toBe('n-revenue')
    expect(evaluation.results['n-contribution']?.value.status).toBe('ok')
  })
})
