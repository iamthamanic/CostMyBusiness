/**
 * Local adapter implementing BusinessRepository + ProductRepository via cmb.v1.
 * Location: src/features/businesses/persistence/local-business-product-repository.ts
 */
import { DEFAULT_CURRENCY } from '@/core/money'
import {
  clearLocalStore,
  readJsonStore,
  type StorageLike,
  writeJsonStore,
} from '@/shared/infrastructure/local-store'
import type { BusinessRepository } from '../application/business-repository'
import type { Business, CreateBusinessInput, UpdateBusinessInput } from '../domain/business'
import type { ProductRepository } from '../../products/application/product-repository'
import type { CreateProductInput, Product, UpdateProductInput } from '../../products/domain/product'
import { emptySnapshot, parseSnapshot, type LocalSnapshot } from './local-snapshot'

export class LocalStoreCorruptError extends Error {
  readonly code = 'LOCAL_STORE_CORRUPT' as const
  constructor(readonly messageDe: string) {
    super(messageDe)
    this.name = 'LocalStoreCorruptError'
  }
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND' as const
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`)
    this.name = 'NotFoundError'
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

export type LocalRepositories = {
  businesses: BusinessRepository
  products: ProductRepository
  /** Test helper: last load error message (German) when corrupt. */
  getLastLoadErrorDe(): string | null
  reset(): void
}

export function createLocalRepositories(storage?: StorageLike): LocalRepositories {
  let lastLoadErrorDe: string | null = null

  function load(): LocalSnapshot {
    const result = readJsonStore(parseSnapshot, emptySnapshot, storage)
    if (!result.ok) {
      lastLoadErrorDe = result.messageDe
      // Fail closed: empty store, do not trust corrupt payload
      clearLocalStore(storage)
      return emptySnapshot()
    }
    lastLoadErrorDe = null
    return result.data
  }

  function save(snapshot: LocalSnapshot): void {
    // Re-validate before persist (F-02)
    const validated = parseSnapshot(snapshot)
    const written = writeJsonStore(validated, storage)
    if (!written.ok) {
      throw new Error(written.messageDe)
    }
  }

  const businesses: BusinessRepository = {
    async list(workspaceId) {
      return load().businesses.filter((b) => b.workspaceId === workspaceId)
    },
    async get(id) {
      return load().businesses.find((b) => b.id === id) ?? null
    },
    async create(input: CreateBusinessInput) {
      const snapshot = load()
      const ts = nowIso()
      const business: Business = {
        id: newId('biz'),
        workspaceId: input.workspaceId,
        name: input.name,
        defaultCurrency: input.defaultCurrency ?? DEFAULT_CURRENCY,
        createdAt: ts,
        updatedAt: ts,
      }
      snapshot.businesses.push(business)
      save(snapshot)
      return business
    },
    async update(id, input: UpdateBusinessInput) {
      const snapshot = load()
      const index = snapshot.businesses.findIndex((b) => b.id === id)
      if (index < 0) throw new NotFoundError('Business', id)
      const current = snapshot.businesses[index]!
      const updated: Business = {
        ...current,
        name: input.name ?? current.name,
        defaultCurrency: input.defaultCurrency ?? current.defaultCurrency,
        updatedAt: nowIso(),
      }
      snapshot.businesses[index] = updated
      save(snapshot)
      return updated
    },
    async delete(id) {
      const snapshot = load()
      snapshot.businesses = snapshot.businesses.filter((b) => b.id !== id)
      snapshot.products = snapshot.products.filter((p) => p.businessId !== id)
      save(snapshot)
    },
  }

  const products: ProductRepository = {
    async listByBusiness(businessId) {
      return load().products.filter((p) => p.businessId === businessId)
    },
    async get(id) {
      return load().products.find((p) => p.id === id) ?? null
    },
    async getInBusiness(businessId, id) {
      const product = load().products.find((p) => p.id === id) ?? null
      if (!product || product.businessId !== businessId) return null
      return product
    },
    async create(input: CreateProductInput) {
      const snapshot = load()
      const business = snapshot.businesses.find((b) => b.id === input.businessId)
      if (!business) throw new NotFoundError('Business', input.businessId)
      const ts = nowIso()
      const product: Product = {
        id: newId('prd'),
        businessId: input.businessId,
        name: input.name,
        currency: input.currency ?? business.defaultCurrency ?? DEFAULT_CURRENCY,
        price: input.price,
        templateId: input.templateId ?? 'custom',
        templateVersion: input.templateVersion,
        includedOptionalKeys: input.includedOptionalKeys,
        createdAt: ts,
        updatedAt: ts,
      }
      snapshot.products.push(product)
      save(snapshot)
      return product
    },
    async update(id, input: UpdateProductInput) {
      const snapshot = load()
      const index = snapshot.products.findIndex((p) => p.id === id)
      if (index < 0) throw new NotFoundError('Product', id)
      const current = snapshot.products[index]!
      const updated: Product = {
        ...current,
        name: input.name ?? current.name,
        currency: input.currency ?? current.currency,
        price: input.price ?? current.price,
        templateId: input.templateId ?? current.templateId,
        templateVersion: input.templateVersion ?? current.templateVersion,
        includedOptionalKeys: input.includedOptionalKeys ?? current.includedOptionalKeys,
        updatedAt: nowIso(),
      }
      snapshot.products[index] = updated
      save(snapshot)
      return updated
    },
    async delete(id) {
      const snapshot = load()
      snapshot.products = snapshot.products.filter((p) => p.id !== id)
      save(snapshot)
    },
  }

  return {
    businesses,
    products,
    getLastLoadErrorDe: () => lastLoadErrorDe,
    reset: () => clearLocalStore(storage),
  }
}
