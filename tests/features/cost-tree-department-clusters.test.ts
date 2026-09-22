import { describe, expect, it } from 'vitest'
import { evaluate } from '@/core/calculation'
import { buildProductModel } from '@/features/cost-graph/application/build-product-model'
import { mapDomainToFlow } from '@/features/cost-graph/application/map-domain-to-flow'
import { resolveViewType } from '@/features/cost-graph/application/view-node-type'
import { ProductSchema } from '@/features/products'

describe('cost-graph department clusters', () => {
  const product = ProductSchema.parse({
    id: 'prd_1',
    businessId: 'biz_1',
    name: 'Test',
    currency: 'EUR',
    sellingPrice: 50,
    priceKind: 'gross',
    taxRatePercent: 0,
    pricingBasis: 'per_unit',
    templateId: 'traffic-safety',
    templateVersion: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  })

  it('maps groups to department view with visible children', () => {
    const model = buildProductModel(product)
    const evaluation = evaluate(model)
    const flow = mapDomainToFlow(model, evaluation)

    const departments = flow.nodes.filter((n) => n.data.viewType === 'department')
    expect(departments.length).toBeGreaterThan(0)
    expect(departments.every((d) => d.data.childCount >= 0)).toBe(true)

    const costs = flow.nodes.filter((n) => n.data.viewType === 'costCalculator')
    expect(costs.length).toBeGreaterThan(1)

    const ops = model.nodes.find((n) => n.key === 'g_operations' || n.key === 'operations')
    expect(ops).toBeTruthy()
    expect(resolveViewType(ops!)).toBe('department')
  })

  it('hides children when department is collapsed', () => {
    const model = buildProductModel(product)
    const evaluation = evaluate(model)
    const ops = model.nodes.find((n) => n.key === 'g_operations')
    expect(ops).toBeTruthy()
    const full = mapDomainToFlow(model, evaluation)
    const collapsed = mapDomainToFlow(model, evaluation, {
      collapsedDepartmentIds: new Set([ops!.id]),
    })
    expect(collapsed.nodes.length).toBeLessThan(full.nodes.length)
    expect(collapsed.nodes.some((n) => n.id === ops!.id)).toBe(true)
    const childStillVisible = model.nodes.some(
      (n) => n.parentId === ops!.id && collapsed.nodes.some((c) => c.id === n.id),
    )
    expect(childStillVisible).toBe(false)
  })

  it('marks empty departments without fake zero child counts from missing nodes', () => {
    const model = buildProductModel(product, undefined)
    // remove all ops children
    const ops = model.nodes.find((n) => n.key === 'g_operations')!
    const stripped = {
      ...model,
      nodes: model.nodes.filter((n) => n.parentId !== ops.id),
      edges: model.edges.filter(
        (e) =>
          model.nodes.find((n) => n.id === e.sourceNodeId)?.parentId !== ops.id &&
          model.nodes.find((n) => n.id === e.targetNodeId)?.parentId !== ops.id,
      ),
    }
    // keep ops group
    const evaluation = evaluate(stripped)
    const flow = mapDomainToFlow(stripped, evaluation)
    const dept = flow.nodes.find((n) => n.id === ops.id)
    expect(dept?.data.emptyDepartment).toBe(true)
    expect(dept?.data.childCount).toBe(0)
  })
})
