import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { composeFunnelsIntoModel } from '@/features/cost-graph/application/compose-funnels-into-model'
import { projectWorkbenchView } from '@/features/cost-graph/application/project-workbench-view'
import { updateNodeInputs } from '@/features/cost-graph/application/mutate-model'
import { buildProductModel } from '@/features/cost-graph'
import type { MarketingFunnel } from '@/features/funnels'
import { ProductSchema } from '@/features/products'

describe('workbench calculation correctness', () => {
  const product = ProductSchema.parse({
    id: 'prd_wb',
    businessId: 'biz_1',
    name: 'Halteverbotszone Berlin',
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

  it('computes contribution then fully loaded profit separately', () => {
    const model = buildProductModel(product)
    const evaluation = evaluate(model)
    const contribution = model.nodes.find((n) => n.key === 'contribution')!
    const profit = model.nodes.find((n) => n.key === 'profit')!
    const c = evaluation.results[contribution.id]
    const p = evaluation.results[profit.id]
    expect(c?.value.status).toBe('ok')
    expect(p?.value.status).toBe('ok')
    if (c?.value.status !== 'ok' || p?.value.status !== 'ok') return

    let allocated = 0
    for (const node of model.nodes) {
      if (node.kind !== 'cost') continue
      if (node.allocation?.rule !== 'allocated') continue
      const r = evaluation.results[node.id]
      if (r?.value.status === 'ok') allocated += r.value.perUnit
    }
    expect(p.value.perUnit).toBeCloseTo(c.value.perUnit - allocated, 5)
    expect(p.value.perUnit).toBeLessThan(c.value.perUnit)
  })

  it('updates percentage_revenue when net revenue changes', () => {
    let model = buildProductModel(product)
    const payment = model.nodes.find((n) => n.key === 'ops_payment')!
    const before = evaluate(model).results[payment.id]
    expect(before?.value.status).toBe('ok')

    const revenue = model.nodes.find((n) => n.key === 'revenue')!
    model = {
      ...model,
      nodes: model.nodes.map((n) =>
        n.id === revenue.id
          ? { ...n, inputs: { ...n.inputs, price: 99 / 1.19 } }
          : n,
      ),
    }
    const after = evaluate(model).results[payment.id]
    expect(after?.value.status).toBe('ok')
    if (before?.value.status === 'ok' && after?.value.status === 'ok') {
      expect(after.value.perUnit).toBeGreaterThan(before.value.perUnit)
    }
  })

  it('evaluates formulaRef via restricted AST', () => {
    let model = buildProductModel(product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')!
    model = {
      ...model,
      nodes: model.nodes.map((n) =>
        n.id === driver.id
          ? { ...n, formulaRef: 'rate * hoursPerStop * stopsPerOrder', inputs: { ...n.inputs } }
          : n,
      ),
    }
    const result = evaluate(model).results[driver.id]
    expect(result?.value.status).toBe('ok')
    if (result?.value.status === 'ok') {
      expect(result.value.perUnit).toBeCloseTo(16.8, 5)
    }
  })

  it('folds funnel CAC into marketing totals and contribution', () => {
    const model = buildProductModel(product)
    const funnel: MarketingFunnel = {
      id: 'fnl_g',
      productId: product.id,
      type: 'marketing',
      name: 'Google Ads',
      stages: [
        { key: 'impressions', labelDe: 'Impressions', order: 0, count: 10000 },
        { key: 'clicks', labelDe: 'Clicks', order: 1, count: 500 },
        { key: 'conversions', labelDe: 'Conversions', order: 2, count: 50 },
      ],
      costs: { mediaSpend: 1000, agency: 100, personnel: 200, tools: 50 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const before = evaluate(model)
    const contribution = model.nodes.find((n) => n.key === 'contribution')!
    const beforeC = before.results[contribution.id]

    const composed = composeFunnelsIntoModel(model, [funnel])
    const after = evaluate(composed)
    const afterC = after.results[contribution.id]
    expect(beforeC?.value.status).toBe('ok')
    expect(afterC?.value.status).toBe('ok')
    if (beforeC?.value.status === 'ok' && afterC?.value.status === 'ok') {
      expect(afterC.value.perUnit).toBeLessThan(beforeC.value.perUnit)
    }
    const view = projectWorkbenchView(composed, after)
    const marketing = view.departments.find((d) => d.tone === 'marketing')
    expect(marketing?.rows.some((r) => r.isFunnel && r.label === 'Google Ads')).toBe(true)
  })

  it('cascades Fahrer rate change into contribution', () => {
    let model = buildProductModel(product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')!
    const contribution = model.nodes.find((n) => n.key === 'contribution')!
    const before = evaluate(model).results[contribution.id]
    model = updateNodeInputs(model, driver.id, { rate: 40 })
    const after = evaluate(model).results[contribution.id]
    expect(before?.value.status).toBe('ok')
    expect(after?.value.status).toBe('ok')
    if (before?.value.status === 'ok' && after?.value.status === 'ok') {
      expect(after.value.perUnit).toBeLessThan(before.value.perUnit)
    }
  })
})
