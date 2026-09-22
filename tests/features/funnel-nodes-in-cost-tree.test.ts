import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import {
  funnelFlowNodeId,
  mapFunnelsToFlow,
} from '@/features/cost-graph/application/funnel-graph-adapter'
import { buildProductModel } from '@/features/cost-graph'
import type { MarketingFunnel } from '@/features/funnels'
import { calculateMarketingMetrics } from '@/features/funnels'
import { ProductSchema } from '@/features/products'

describe('funnel nodes in cost tree', () => {
  const product = ProductSchema.parse({
    id: 'prd_1',
    businessId: 'biz_1',
    name: 'HZ',
    currency: 'EUR',
    sellingPrice: 89,
    priceKind: 'gross',
    taxRatePercent: 19,
    pricingBasis: 'per_order',
    templateId: 'traffic-safety-halteverbotszone',
    templateVersion: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  })

  const marketingFunnel: MarketingFunnel = {
    id: 'fnl_1',
    productId: 'prd_1',
    type: 'marketing',
    name: 'Google Generic',
    stages: [
      { key: 'impressions', labelDe: 'Impressions', order: 0, count: 10000 },
      { key: 'clicks', labelDe: 'Clicks', order: 1, count: 500 },
      { key: 'conversions', labelDe: 'Conversions', order: 2, count: 50 },
    ],
    costs: { mediaSpend: 1000, agency: 100, personnel: 200, tools: 50 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  it('places marketing funnel under Marketing department using existing CAC metrics', () => {
    const model = buildProductModel(product)
    const flow = mapFunnelsToFlow(model, [marketingFunnel])
    expect(flow.nodes).toHaveLength(1)
    expect(flow.nodes[0]!.data.viewType).toBe('funnel')
    expect(flow.nodes[0]!.data.label).toBe('Google Generic')
    const metrics = calculateMarketingMetrics(marketingFunnel)
    expect(metrics.fullyLoadedCac.status).toBe('ok')
    if (metrics.fullyLoadedCac.status === 'ok') {
      expect(flow.nodes[0]!.data.displayValue).toContain(metrics.fullyLoadedCac.value.toFixed(2))
    }
    const marketing = model.nodes.find((n) => n.key === 'g_marketing')
    expect(marketing).toBeTruthy()
    expect(flow.edges[0]!.target).toBe(marketing!.id)
    expect(flow.nodes[0]!.id).toBe(funnelFlowNodeId('fnl_1'))
  })

  it('hides funnel when parent department is collapsed', () => {
    const model = buildProductModel(product)
    const marketing = model.nodes.find((n) => n.key === 'g_marketing')!
    const flow = mapFunnelsToFlow(model, [marketingFunnel], {
      collapsedDepartmentIds: new Set([marketing.id]),
    })
    expect(flow.nodes).toHaveLength(0)
  })

  it('does not invent funnel nodes when list is empty', () => {
    const model = buildProductModel(product)
    const flow = mapFunnelsToFlow(model, [])
    expect(flow.nodes).toHaveLength(0)
    evaluate(model) // domain still evaluates without funnels
  })
})
