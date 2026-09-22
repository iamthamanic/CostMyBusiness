import { describe, expect, it } from 'vitest'
import { createLocalRepositories } from '@/features/businesses'
import {
  calculateMarketingMetrics,
  type MarketingFunnel,
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

/** Google Ads-like fixture: spend, clicks, conversions + operating costs */
function googleAdsFixture(overrides: Partial<MarketingFunnel> = {}): MarketingFunnel {
  return {
    id: 'fnl_google',
    productId: 'prd_1',
    type: 'marketing',
    name: 'Google Generic',
    stages: [
      { key: 'impressions', labelDe: 'Impressionen', order: 0, count: 100_000 },
      { key: 'clicks', labelDe: 'Klicks', order: 1, count: 2_000 },
      { key: 'conversions', labelDe: 'Conversions', order: 2, count: 100 },
    ],
    costs: {
      mediaSpend: 4_000,
      agency: 500,
      personnel: 800,
      tools: 200,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('marketing funnel metrics', () => {
  it('derives CPC, media CPA/CAC and fully loaded CAC for Google-Ads-like inputs', () => {
    const metrics = calculateMarketingMetrics(googleAdsFixture())
    expect(metrics.ctr.status).toBe('ok')
    expect(metrics.cvr.status).toBe('ok')
    if (metrics.cpc.status === 'ok') expect(metrics.cpc.value).toBe(2)
    if (metrics.mediaCpa.status === 'ok') {
      expect(metrics.mediaCpa.value).toBe(40)
      expect(metrics.mediaCpa.scope).toBe('media_only')
    }
    if (metrics.mediaCac.status === 'ok') {
      expect(metrics.mediaCac.value).toBe(40)
      expect(metrics.mediaCac.scope).toBe('media_only')
    }
    if (metrics.fullyLoadedCac.status === 'ok') {
      expect(metrics.fullyLoadedCac.value).toBe(55)
      expect(metrics.fullyLoadedCac.scope).toBe('fully_loaded')
    }
    expect(metrics.fullyLoadedSpend).toBe(5_500)
  })

  it('leaves CPC unresolved when clicks are missing (not zero)', () => {
    const funnel = googleAdsFixture({
      stages: [
        { key: 'impressions', labelDe: 'Impressionen', order: 0, count: 10_000 },
        { key: 'clicks', labelDe: 'Klicks', order: 1 },
        { key: 'conversions', labelDe: 'Conversions', order: 2, count: 10 },
      ],
    })
    const metrics = calculateMarketingMetrics(funnel)
    expect(metrics.cpc.status).toBe('unresolved')
    if (metrics.cpc.status === 'unresolved') {
      expect(metrics.cpc.messageDe).toMatch(/Klicks/)
    }
  })

  it('warns when media spend is zero but clicks exist', () => {
    const metrics = calculateMarketingMetrics(
      googleAdsFixture({
        costs: { mediaSpend: 0, agency: 100, personnel: 0, tools: 0 },
      }),
    )
    expect(metrics.cpc.status).toBe('unresolved')
    if (metrics.cpc.status === 'unresolved') {
      expect(metrics.cpc.reason).toBe('zero_spend')
    }
  })
})

describe('marketing funnel repository', () => {
  it('CRUD scopes funnels to a product', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const biz = await repos.businesses.create({ workspaceId: 'ws', name: 'Demo' })
    const product = await repos.products.create({ businessId: biz.id, name: 'Absperrung' })
    const funnel = await repos.funnels.createMarketing({
      productId: product.id,
      name: 'Google Generic',
      costs: { mediaSpend: 1000 },
    })
    expect(funnel.type).toBe('marketing')
    expect(funnel.stages.length).toBe(3)

    const listed = await repos.funnels.listByProduct(product.id)
    expect(listed).toHaveLength(1)

    const updated = await repos.funnels.update(funnel.id, {
      costs: { mediaSpend: 2000, agency: 100 },
    })
    expect(updated.costs.mediaSpend).toBe(2000)
    expect(updated.costs.agency).toBe(100)

    await repos.funnels.delete(funnel.id)
    expect(await repos.funnels.listByProduct(product.id)).toHaveLength(0)
  })
})
