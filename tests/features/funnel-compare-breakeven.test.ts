import { describe, expect, it } from 'vitest'
import { breakEvenUnits } from '@/core/allocation'
import type { DomainModel } from '@/core/model'
import { createLocalRepositories } from '@/features/businesses'
import {
  calculateSalesMetrics,
  filterProfitabilityByFunnel,
  type SalesFunnel,
} from '@/features/funnels'
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

const salesFixture: SalesFunnel = {
  id: 'fnl_sales',
  productId: 'prd_1',
  type: 'sales',
  enabled: true,
  name: 'Outbound',
  stages: [
    { key: 'leads', labelDe: 'Leads', order: 0, count: 200 },
    { key: 'mql', labelDe: 'MQL', order: 1, count: 80 },
    { key: 'sql', labelDe: 'SQL', order: 2, count: 40 },
    { key: 'proposal', labelDe: 'Angebot', order: 3, count: 20 },
    { key: 'won', labelDe: 'Gewonnen', order: 4, count: 10 },
  ],
  costs: { personnel: 4000, crm: 200, commission: 500, tools: 300 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const modelFixture: DomainModel = {
  id: 'm1',
  version: 1,
  volume: 10,
  nodes: [
    {
      id: 'n-revenue',
      kind: 'revenue',
      key: 'revenue',
      label: 'Umsatz',
      enabled: true,
      inputs: { price: 100 },
    },
    {
      id: 'n-ops',
      kind: 'cost',
      key: 'ops',
      label: 'Ops',
      enabled: true,
      costBehavior: 'per_unit',
      inputs: { rate: 20 },
      allocation: { rule: 'direct' },
    },
    {
      id: 'n-contribution',
      kind: 'result',
      key: 'contribution',
      label: 'DB',
      enabled: true,
      inputs: {},
    },
  ],
  edges: [
    { id: 'e1', sourceNodeId: 'n-revenue', targetNodeId: 'n-contribution', relation: 'feeds' },
    { id: 'e2', sourceNodeId: 'n-ops', targetNodeId: 'n-contribution', relation: 'feeds' },
  ],
}

describe('sales funnels and break-even', () => {
  it('calculates sales acquisition cost from won deals', () => {
    const metrics = calculateSalesMetrics(salesFixture)
    expect(metrics.salesAcquisitionCost.status).toBe('ok')
    if (metrics.salesAcquisitionCost.status === 'ok') {
      expect(metrics.salesAcquisitionCost.value).toBe(500)
    }
  })

  it('filters profitability by funnel and explains missing filter', () => {
    const none = filterProfitabilityByFunnel(modelFixture, null)
    expect(none.status).toBe('unresolved')
    if (none.status === 'unresolved') {
      expect(none.messageDe).toMatch(/Kein Funnel-Filter/)
    }
    const filtered = filterProfitabilityByFunnel(modelFixture, salesFixture)
    expect(filtered.status).toBe('ok')
    if (filtered.status === 'ok') {
      expect(filtered.acquisitionCostPerUnit).toBe(500)
      expect(filtered.contributionPerUnit).toBe(80)
    }
  })

  it('break-even panel inputs use core helper with formula', () => {
    const ok = breakEvenUnits({ fixedCost: 1000, contributionPerUnit: 25 })
    expect(ok.status).toBe('ok')
    if (ok.status === 'ok') {
      expect(ok.units).toBe(40)
      expect(ok.formula).toBe('fixedCost / contributionPerUnit')
    }
    const bad = breakEvenUnits({ fixedCost: 1000, contributionPerUnit: 0 })
    expect(bad.status).toBe('unresolved')
  })

  it('persists sales funnels via local repository', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({ businessId: biz.id, name: 'P' })
    const funnel = await repos.funnels.createSales({
      productId: product.id,
      name: 'Outbound',
      costs: { personnel: 1000 },
    })
    expect(funnel.type).toBe('sales')
    const updated = await repos.funnels.update(funnel.id, {
      salesCosts: { personnel: 2000, commission: 100 },
    })
    expect(updated.type).toBe('sales')
    if (updated.type === 'sales') {
      expect(updated.costs.personnel).toBe(2000)
      expect(updated.costs.commission).toBe(100)
    }
  })
})
