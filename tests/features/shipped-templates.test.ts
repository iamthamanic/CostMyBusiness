import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { removeNode } from '@/features/cost-graph/application/mutate-model'
import type { Product } from '@/features/products'
import {
  applyShippedTemplate,
  getLayerGuidance,
  getShippedTemplate,
  listShippedTemplates,
  listSuggestedOptionalNodes,
  UnknownTemplateError,
} from '@/features/templates'
import trafficSafetyJson from '@/data/default-templates/traffic-safety.v1.json'

function productFixture(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prd_test',
    businessId: 'biz_1',
    name: 'Test',
    currency: 'EUR',
    price: 100,
    templateId: 'custom',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('shipped templates', () => {
  it('ships five industry templates validated by Zod', () => {
    const list = listShippedTemplates()
    expect(list.map((t) => t.id).sort()).toEqual(
      ['custom', 'ecommerce', 'saas', 'service', 'traffic-safety'].sort(),
    )
    for (const t of list) {
      expect(t.version).toBe(1)
      expect(t.nodes.length).toBeGreaterThan(0)
    }
  })

  it('applies each template into a connected calculable graph', () => {
    for (const template of listShippedTemplates()) {
      const product = productFixture({ templateId: template.id, price: 50 })
      const model = applyShippedTemplate(template, product)
      expect(model.nodes.some((n) => n.key === 'revenue')).toBe(true)
      expect(model.nodes.some((n) => n.key === 'contribution')).toBe(true)
      expect(model.edges.length).toBeGreaterThan(0)
      const result = evaluate(model)
      const contribution = model.nodes.find((n) => n.key === 'contribution')!
      expect(result.results[contribution.id]?.value.status).toBe('ok')
    }
  })

  it('preselects Traffic Safety ops suggestions and allows deselection', () => {
    const template = getShippedTemplate('traffic-safety')
    const optionals = listSuggestedOptionalNodes(template)
    const opsKeys = optionals.filter((n) => n.layerKey === 'operations').map((n) => n.key)
    expect(opsKeys).toEqual(
      expect.arrayContaining([
        'ops_drivers',
        'ops_vehicles',
        'ops_equipment',
        'ops_permits',
        'ops_storage',
        'ops_setup_removal',
        'ops_subcontractors',
      ]),
    )

    const withoutDrivers = applyShippedTemplate(template, productFixture({ templateId: 'traffic-safety' }), {
      includedOptionalKeys: opsKeys.filter((k) => k !== 'ops_drivers'),
    })
    expect(withoutDrivers.nodes.some((n) => n.key === 'ops_drivers')).toBe(false)
    expect(withoutDrivers.nodes.some((n) => n.key === 'ops_vehicles')).toBe(true)
  })

  it('does not mutate shipped JSON when product nodes are removed', () => {
    const before = structuredClone(trafficSafetyJson)
    const template = getShippedTemplate('traffic-safety')
    const model = applyShippedTemplate(template, productFixture({ templateId: 'traffic-safety' }))
    const driver = model.nodes.find((n) => n.key === 'ops_drivers')
    expect(driver).toBeTruthy()
    removeNode(model, driver!.id)
    expect(trafficSafetyJson).toEqual(before)
    expect(getShippedTemplate('traffic-safety').nodes.some((n) => n.key === 'ops_drivers')).toBe(true)
  })

  it('exposes industry layer guidance for Traffic Safety operations', () => {
    const guidance = getLayerGuidance('traffic-safety', 'operations')
    expect(guidance?.generalDe).toMatch(/Erbringung/)
    expect(guidance?.industryDe).toMatch(/Verkehrssicherung/)
    expect(guidance?.industryExamplesDe).toEqual(
      expect.arrayContaining(['Fahrer', 'Fahrzeuge', 'Nachunternehmer']),
    )
  })

  it('throws a German error for unknown template ids', () => {
    expect(() => getShippedTemplate('does-not-exist')).toThrow(UnknownTemplateError)
    try {
      getShippedTemplate('does-not-exist')
    } catch (err) {
      expect(err).toBeInstanceOf(UnknownTemplateError)
      if (err instanceof UnknownTemplateError) {
        expect(err.messageDe).toMatch(/Unbekannte Vorlage/)
      }
    }
  })
})
