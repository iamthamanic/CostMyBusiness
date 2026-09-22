import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { resolveNetRevenue } from '@/core/pricing'
import { createLocalRepositories } from '@/features/businesses'
import { buildProductModel } from '@/features/cost-graph'
import { ProductSchema } from '@/features/products'
import type { StorageLike } from '@/shared/infrastructure/local-store'

function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

describe('product pricing gross/net', () => {
  it('resolves gross 89 EUR at 19% VAT to net 74.79', () => {
    const result = resolveNetRevenue({
      sellingPrice: 89,
      priceKind: 'gross',
      taxRatePercent: 19,
      pricingBasis: 'per_order',
      currency: 'EUR',
    })
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.netRevenue).toBe(74.79)
      expect(result.grossRevenue).toBe(89)
    }
  })

  it('rejects invalid tax without silent NaN', () => {
    const result = resolveNetRevenue({
      sellingPrice: 89,
      priceKind: 'gross',
      taxRatePercent: 100,
      pricingBasis: 'per_order',
      currency: 'EUR',
    })
    expect(result.status).toBe('unresolved')
    if (result.status === 'unresolved') {
      expect(result.messageDe).toMatch(/USt/)
    }
  })

  it('migrates legacy price-only products as gross with 0% tax', () => {
    const product = ProductSchema.parse({
      id: 'prd_legacy',
      businessId: 'biz_1',
      name: 'Alt',
      currency: 'EUR',
      price: 50,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    expect(product.sellingPrice).toBe(50)
    expect(product.priceKind).toBe('gross')
    expect(product.taxRatePercent).toBe(0)
    expect(product.price).toBe(50)
  })

  it('applies net revenue into domain model revenue node (VAT not a cost)', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({
      businessId: biz.id,
      name: 'Halteverbotszone Berlin',
      sellingPrice: 89,
      priceKind: 'gross',
      taxRatePercent: 19,
      pricingBasis: 'per_order',
      templateId: 'custom',
      templateVersion: 1,
    })
    const model = buildProductModel(product)
    const revenue = model.nodes.find((n) => n.key === 'revenue')
    expect(revenue).toBeTruthy()
    expect(revenue?.inputs.price).toBe(74.79)
    expect(model.nodes.some((n) => n.kind === 'cost' && n.key.toLowerCase().includes('vat'))).toBe(
      false,
    )
    expect(model.nodes.some((n) => n.kind === 'cost' && n.label.toLowerCase().includes('ust'))).toBe(
      false,
    )
    const evaluation = evaluate(model)
    const revResult = revenue ? evaluation.results[revenue.id] : undefined
    expect(revResult?.value.status).toBe('ok')
    if (revResult?.value.status === 'ok') {
      expect(revResult.value.perUnit).toBe(74.79)
    }
  })
})
