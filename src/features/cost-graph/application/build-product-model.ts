/**
 * Build a minimal domain model for a product until templates ship.
 * Location: src/features/cost-graph/application/build-product-model.ts
 */
import type { DomainModel } from '@/core/model'
import type { Product } from '@/features/products'

export function buildProductModel(product: Product, volume = 100): DomainModel {
  const price = product.price ?? 0
  return {
    id: `model_${product.id}`,
    version: 1,
    volume,
    nodes: [
      {
        id: 'n-revenue',
        kind: 'revenue',
        key: 'revenue',
        label: 'Umsatz',
        enabled: true,
        inputs: { price },
      },
      {
        id: 'n-ops',
        kind: 'cost',
        key: 'ops_labor',
        label: 'Betrieb Personal',
        enabled: true,
        costBehavior: 'per_hour',
        inputs: { rate: 40, hoursPerOrder: 0.5 },
        allocation: { rule: 'direct' },
      },
      {
        id: 'n-contribution',
        kind: 'result',
        key: 'contribution',
        label: 'Deckungsbeitrag',
        enabled: true,
        inputs: {},
      },
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'n-revenue', targetNodeId: 'n-contribution', relation: 'feeds' },
      { id: 'e2', sourceNodeId: 'n-ops', targetNodeId: 'n-contribution', relation: 'feeds' },
    ],
  }
}
