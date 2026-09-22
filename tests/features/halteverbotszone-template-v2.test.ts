import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { removeNode } from '@/features/cost-graph/application/mutate-model'
import { resolveViewType } from '@/features/cost-graph/application/view-node-type'
import { ProductSchema } from '@/features/products'
import {
  applyShippedTemplate,
  getShippedTemplate,
  listSuggestedOptionalNodes,
  UnknownTemplateError,
} from '@/features/templates'
import halteJson from '@/data/default-templates/traffic-safety-halteverbotszone.v1.json'

describe('halteverbotszone template v2', () => {
  const product = ProductSchema.parse({
    id: 'prd_hz',
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

  it('ships product-type template with five department clusters', () => {
    const template = getShippedTemplate('traffic-safety-halteverbotszone')
    expect(template.productType).toBe('halteverbotszone')
    expect(template.industry).toBe('traffic-safety')
    const deptKeys = template.nodes.filter((n) => n.kind === 'group').map((n) => n.key)
    expect(deptKeys).toEqual(
      expect.arrayContaining([
        'g_marketing',
        'g_sales',
        'g_operations',
        'g_support',
        'g_overhead',
      ]),
    )
    const optionals = listSuggestedOptionalNodes(template).map((n) => n.key)
    expect(optionals).toEqual(
      expect.arrayContaining([
        'mkt_google_ads',
        'ops_drivers',
        'ops_permit',
        'sales_phone',
        'sup_customer_service',
        'oh_hr',
      ]),
    )
  })

  it('applies into calculable model with Fahrer defaults and viewable departments', () => {
    const template = getShippedTemplate('traffic-safety-halteverbotszone')
    const model = applyShippedTemplate(template, product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')
    expect(driver?.inputs.rate).toBe(28)
    expect(driver?.inputs.hoursPerStop).toBe(0.3)
    expect(driver?.inputs.stopsPerOrder).toBe(2)
    const depts = model.nodes.filter((n) => resolveViewType(n) === 'department')
    expect(depts.length).toBe(5)
    const evaluation = evaluate(model)
    const contribution = model.nodes.find((n) => n.key === 'contribution')!
    expect(evaluation.results[contribution.id]?.value.status).toBe('ok')
    const revenue = model.nodes.find((n) => n.key === 'revenue')!
    expect(revenue.inputs.price).toBe(74.79)
  })

  it('allows removing optional positions without mutating shipped JSON', () => {
    const before = structuredClone(halteJson)
    const template = getShippedTemplate('traffic-safety-halteverbotszone')
    let model = applyShippedTemplate(template, product)
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')!
    model = removeNode(model, driver.id)
    expect(model.nodes.some((n) => n.key === 'ops_drivers')).toBe(false)
    expect(halteJson).toEqual(before)
  })

  it('rejects unknown product-type template id in German', () => {
    expect(() => getShippedTemplate('traffic-safety-unknown-product')).toThrow(UnknownTemplateError)
    try {
      getShippedTemplate('traffic-safety-unknown-product')
    } catch (err) {
      expect(err).toBeInstanceOf(UnknownTemplateError)
      if (err instanceof UnknownTemplateError) {
        expect(err.messageDe).toMatch(/Unbekannte Vorlage/)
      }
    }
  })
})
