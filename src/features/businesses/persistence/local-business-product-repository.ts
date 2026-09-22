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
import type { FunnelRepository } from '../../funnels/application/funnel-repository'
import {
  defaultMarketingStages,
  type CreateMarketingFunnelInput,
  type MarketingFunnel,
  type UpdateMarketingFunnelInput,
} from '../../funnels/domain/marketing-funnel'
import type { PlanningRepository } from '../../scenarios/application/planning-repository'
import {
  removeOverride,
  setOverride,
  wouldCreateCycle,
} from '../../scenarios/application/resolve-context'
import {
  ScenarioCycleError,
  type ProductPlanningState,
  type Scenario,
} from '../../scenarios/domain/planning'
import type { CustomTemplateRepository } from '../../templates/application/custom-template-repository'
import { domainModelToTemplateDefinition } from '../../templates/application/model-to-template'
import {
  DuplicateTemplateNameError,
  type CustomTemplate,
} from '../../templates/domain/custom-template'
import { defaultPeriod, type PeriodType } from '@/core/periods'
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
  funnels: FunnelRepository
  planning: PlanningRepository
  customTemplates: CustomTemplateRepository
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
      const removedProductIds = new Set(
        snapshot.products.filter((p) => p.businessId === id).map((p) => p.id),
      )
      snapshot.products = snapshot.products.filter((p) => p.businessId !== id)
      snapshot.funnels = snapshot.funnels.filter((f) => !removedProductIds.has(f.productId))
      snapshot.planning = snapshot.planning.filter((p) => !removedProductIds.has(p.productId))
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
      snapshot.funnels = snapshot.funnels.filter((f) => f.productId !== id)
      snapshot.planning = snapshot.planning.filter((p) => p.productId !== id)
      save(snapshot)
    },
  }

  const funnels: FunnelRepository = {
    async listByProduct(productId) {
      return load().funnels.filter((f) => f.productId === productId)
    },
    async get(id) {
      return load().funnels.find((f) => f.id === id) ?? null
    },
    async createMarketing(input: CreateMarketingFunnelInput) {
      const snapshot = load()
      const product = snapshot.products.find((p) => p.id === input.productId)
      if (!product) throw new NotFoundError('Product', input.productId)
      const ts = nowIso()
      const funnel: MarketingFunnel = {
        id: newId('fnl'),
        productId: input.productId,
        type: 'marketing',
        name: input.name,
        stages: input.stages ?? defaultMarketingStages(),
        costs: {
          mediaSpend: input.costs?.mediaSpend ?? 0,
          agency: input.costs?.agency ?? 0,
          personnel: input.costs?.personnel ?? 0,
          tools: input.costs?.tools ?? 0,
        },
        createdAt: ts,
        updatedAt: ts,
      }
      snapshot.funnels.push(funnel)
      save(snapshot)
      return funnel
    },
    async update(id, input: UpdateMarketingFunnelInput) {
      const snapshot = load()
      const index = snapshot.funnels.findIndex((f) => f.id === id)
      if (index < 0) throw new NotFoundError('Funnel', id)
      const current = snapshot.funnels[index]!
      const updated: MarketingFunnel = {
        ...current,
        name: input.name ?? current.name,
        stages: input.stages ?? current.stages,
        costs: {
          mediaSpend: input.costs?.mediaSpend ?? current.costs.mediaSpend,
          agency: input.costs?.agency ?? current.costs.agency,
          personnel: input.costs?.personnel ?? current.costs.personnel,
          tools: input.costs?.tools ?? current.costs.tools,
        },
        updatedAt: nowIso(),
      }
      snapshot.funnels[index] = updated
      save(snapshot)
      return updated
    },
    async delete(id) {
      const snapshot = load()
      snapshot.funnels = snapshot.funnels.filter((f) => f.id !== id)
      save(snapshot)
    },
  }

  function emptyPlanning(productId: string): ProductPlanningState {
    return {
      productId,
      period: defaultPeriod(),
      activeContextId: 'actual',
      actualValues: {},
      budgetValues: {},
      scenarios: [],
      updatedAt: nowIso(),
    }
  }

  function getPlanningOrCreate(snapshot: LocalSnapshot, productId: string): ProductPlanningState {
    const existing = snapshot.planning.find((p) => p.productId === productId)
    if (existing) return existing
    const created = emptyPlanning(productId)
    snapshot.planning.push(created)
    return created
  }

  function writePlanning(snapshot: LocalSnapshot, state: ProductPlanningState): ProductPlanningState {
    const index = snapshot.planning.findIndex((p) => p.productId === state.productId)
    const next = { ...state, updatedAt: nowIso() }
    if (index < 0) snapshot.planning.push(next)
    else snapshot.planning[index] = next
    save(snapshot)
    return next
  }

  const planning: PlanningRepository = {
    async getForProduct(productId) {
      const snapshot = load()
      const product = snapshot.products.find((p) => p.id === productId)
      if (!product) throw new NotFoundError('Product', productId)
      const state = getPlanningOrCreate(snapshot, productId)
      save(snapshot)
      return state
    },
    async save(state) {
      const snapshot = load()
      return writePlanning(snapshot, state)
    },
    async setActiveContext(productId, contextId) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      if (contextId !== 'actual' && contextId !== 'budget') {
        if (!state.scenarios.some((s) => s.id === contextId)) {
          throw new NotFoundError('Scenario', contextId)
        }
      }
      return writePlanning(snapshot, { ...state, activeContextId: contextId })
    },
    async setPeriod(productId, period: PeriodType) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      return writePlanning(snapshot, { ...state, period })
    },
    async setBaseValue(productId, context, key, value) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      if (context === 'actual') {
        return writePlanning(snapshot, {
          ...state,
          actualValues: { ...state.actualValues, [key]: value },
        })
      }
      return writePlanning(snapshot, {
        ...state,
        budgetValues: { ...state.budgetValues, [key]: value },
      })
    },
    async createScenario(productId, input) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      const scenarioId = newId('scn')
      if (wouldCreateCycle(state, scenarioId, input.base)) {
        throw new ScenarioCycleError(
          'Szenario-Vererbung bildet einen Zyklus und wurde abgelehnt.',
        )
      }
      if (input.base !== 'actual' && input.base !== 'budget') {
        if (!state.scenarios.some((s) => s.id === input.base)) {
          throw new NotFoundError('Scenario', input.base)
        }
      }
      const scenario: Scenario = {
        id: scenarioId,
        name: input.name,
        base: input.base,
        overrides: input.overrides ?? {},
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      const next = writePlanning(snapshot, {
        ...state,
        scenarios: [...state.scenarios, scenario],
        activeContextId: scenario.id,
      })
      return { state: next, scenario }
    },
    async setScenarioOverride(productId, scenarioId, key, value) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      if (!state.scenarios.some((s) => s.id === scenarioId)) {
        throw new NotFoundError('Scenario', scenarioId)
      }
      return writePlanning(snapshot, setOverride(state, scenarioId, key, value))
    },
    async removeScenarioOverride(productId, scenarioId, key) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      if (!state.scenarios.some((s) => s.id === scenarioId)) {
        throw new NotFoundError('Scenario', scenarioId)
      }
      return writePlanning(snapshot, removeOverride(state, scenarioId, key))
    },
    async deleteScenario(productId, scenarioId) {
      const snapshot = load()
      const state = getPlanningOrCreate(snapshot, productId)
      const nextScenarios = state.scenarios.filter((s) => s.id !== scenarioId)
      const activeContextId =
        state.activeContextId === scenarioId ? 'actual' : state.activeContextId
      return writePlanning(snapshot, {
        ...state,
        scenarios: nextScenarios,
        activeContextId,
      })
    },
  }

  const customTemplates: CustomTemplateRepository = {
    async list(workspaceId) {
      return load().customTemplates.filter((t) => t.workspaceId === workspaceId)
    },
    async get(id) {
      return load().customTemplates.find((t) => t.id === id) ?? null
    },
    async saveFromModel(input) {
      const snapshot = load()
      const name = input.name.trim()
      if (!name) {
        throw new Error('Bitte einen Vorlagennamen angeben.')
      }
      const collision = snapshot.customTemplates.some(
        (t) => t.workspaceId === input.workspaceId && t.name.toLowerCase() === name.toLowerCase(),
      )
      if (collision) {
        throw new DuplicateTemplateNameError(
          `Eine Vorlage namens „${name}“ existiert bereits. Bitte einen anderen Namen wählen.`,
        )
      }
      const id = newId('custom')
      const definition = domainModelToTemplateDefinition(input.model, { id, name })
      const ts = nowIso()
      const template: CustomTemplate = {
        id,
        workspaceId: input.workspaceId,
        name,
        version: 1,
        definition,
        createdAt: ts,
        updatedAt: ts,
      }
      snapshot.customTemplates.push(template)
      save(snapshot)
      return template
    },
    async delete(id) {
      const snapshot = load()
      snapshot.customTemplates = snapshot.customTemplates.filter((t) => t.id !== id)
      save(snapshot)
    },
  }

  return {
    businesses,
    products,
    funnels,
    planning,
    customTemplates,
    getLastLoadErrorDe: () => lastLoadErrorDe,
    reset: () => clearLocalStore(storage),
  }
}
