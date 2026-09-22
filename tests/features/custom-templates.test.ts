import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { createLocalRepositories } from '@/features/businesses'
import { buildProductModel } from '@/features/cost-graph/application/build-product-model'
import {
  applyShippedTemplate,
  DuplicateTemplateNameError,
  getShippedTemplate,
} from '@/features/templates'
import trafficSafetyJson from '@/data/default-templates/traffic-safety.v1.json'
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

describe('custom templates', () => {
  it('saves from model without mutating shipped JSON and applies to a new product', async () => {
    const before = structuredClone(trafficSafetyJson)
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({
      businessId: biz.id,
      name: 'Absperrung',
      templateId: 'traffic-safety',
      price: 900,
    })
    const model = buildProductModel(product)
    const saved = await repos.customTemplates.saveFromModel({
      workspaceId: 'ws',
      name: 'Meine Absperrung',
      model,
    })
    expect(saved.id.startsWith('custom_')).toBe(true)
    expect(trafficSafetyJson).toEqual(before)
    expect(getShippedTemplate('traffic-safety').nodes.some((n) => n.key === 'ops_drivers')).toBe(
      true,
    )

    const listed = await repos.customTemplates.list('ws')
    expect(listed).toHaveLength(1)

    const product2 = await repos.products.create({
      businessId: biz.id,
      name: 'Kopie',
      templateId: saved.id,
      templateVersion: saved.version,
      price: 100,
    })
    const applied = applyShippedTemplate(saved.definition, product2)
    const contribution = applied.nodes.find((n) => n.key === 'contribution')!
    expect(evaluate(applied).results[contribution.id]?.value.status).toBe('ok')
  })

  it('rejects duplicate names without overwrite', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({
      businessId: biz.id,
      name: 'P',
      templateId: 'custom',
    })
    const model = buildProductModel(product)
    await repos.customTemplates.saveFromModel({
      workspaceId: 'ws',
      name: 'Duplikat',
      model,
    })
    await expect(
      repos.customTemplates.saveFromModel({
        workspaceId: 'ws',
        name: 'duplikat',
        model,
      }),
    ).rejects.toBeInstanceOf(DuplicateTemplateNameError)
  })
})
