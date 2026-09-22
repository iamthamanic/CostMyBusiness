/**
 * Businesses feature public API — do not deep-import internals from other features.
 * Location: src/features/businesses/index.ts
 */
export type { Business, CreateBusinessInput, UpdateBusinessInput } from './domain/business'
export { BusinessSchema } from './domain/business'
export type { BusinessRepository } from './application/business-repository'
export {
  createLocalRepositories,
  LocalStoreCorruptError,
  NotFoundError,
  type LocalRepositories,
} from './persistence/local-business-product-repository'
export { emptySnapshot, parseSnapshot, LocalSnapshotSchema, type LocalSnapshot } from './persistence/local-snapshot'
