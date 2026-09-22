/**
 * Supabase integration public API — never export a service-role client.
 * Location: src/integrations/supabase/index.ts
 */
export {
  createBrowserSupabaseClient,
  readSupabaseEnv,
  type AppSupabaseClient,
} from './client'
export { createRemoteBusinessRepository } from './remote-business-repository'
export { createRemoteProductRepository } from './remote-product-repository'
export { filterVisibleRows, rlsAllowsOwner } from './rls-policy'
