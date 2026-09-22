import { describe, expect, it } from 'vitest'
import { createLocalRepositories } from '@/features/businesses'
import { LOCAL_STORE_KEY, type StorageLike } from '@/shared/infrastructure/local-store'
import { ProductSchema } from '@/features/products'

function memoryStorage(): StorageLike & { dump(): Record<string, string> } {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
    dump: () => Object.fromEntries(map),
  }
}

describe('local business/product repositories', () => {
  it('round-trips business and product with EUR default', async () => {
    const storage = memoryStorage()
    const repos = createLocalRepositories(storage)

    const business = await repos.businesses.create({
      workspaceId: 'ws_1',
      name: 'Demo GmbH',
    })
    expect(business.defaultCurrency).toBe('EUR')

    const product = await repos.products.create({
      businessId: business.id,
      name: 'Produkt A',
    })
    expect(product.currency).toBe('EUR')

    const listed = await repos.businesses.list('ws_1')
    expect(listed).toHaveLength(1)
    expect(await repos.products.listByBusiness(business.id)).toHaveLength(1)

    // Reload via new repo instance sharing storage
    const repos2 = createLocalRepositories(storage)
    expect(await repos2.businesses.get(business.id)).toMatchObject({ name: 'Demo GmbH' })
    expect(await repos2.products.get(product.id)).toMatchObject({ name: 'Produkt A' })
    expect(storage.dump()[LOCAL_STORE_KEY]).toBeTruthy()
  })

  it('does not return products across businesses', async () => {
    const repos = createLocalRepositories(memoryStorage())
    const a = await repos.businesses.create({ workspaceId: 'ws', name: 'A' })
    const b = await repos.businesses.create({ workspaceId: 'ws', name: 'B' })
    const product = await repos.products.create({ businessId: a.id, name: 'Only A' })

    expect(await repos.products.getInBusiness(b.id, product.id)).toBeNull()
    expect(await repos.products.getInBusiness(a.id, product.id)).toMatchObject({ name: 'Only A' })
  })

  it('rejects invalid payloads with Zod', () => {
    expect(() => ProductSchema.parse({ id: '', businessId: 'x', name: 'n' })).toThrow()
  })

  it('fails closed on corrupt localStorage', async () => {
    const storage = memoryStorage()
    storage.setItem(LOCAL_STORE_KEY, '{not-json')
    const repos = createLocalRepositories(storage)
    expect(await repos.businesses.list('ws')).toEqual([])
    expect(repos.getLastLoadErrorDe()).toMatch(/beschädigt/)
  })
})
