/**
 * Typed localStorage helper for CostMyBusiness V1 local adapter.
 * Location: src/shared/infrastructure/local-store.ts
 * Key: cmb.v1 — never stores auth tokens/secrets.
 */
export const LOCAL_STORE_KEY = 'cmb.v1'

export type LocalStoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'corrupt' | 'unavailable'; messageDe: string }

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

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

export function resolveStorage(explicit?: StorageLike): StorageLike {
  if (explicit) return explicit
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      const ls = globalThis.localStorage
      const probe = '__cmb_probe__'
      ls.setItem(probe, '1')
      ls.removeItem(probe)
      return ls
    } catch {
      return memoryStorage()
    }
  }
  return memoryStorage()
}

export function readJsonStore<T>(
  parse: (raw: unknown) => T,
  empty: () => T,
  storage?: StorageLike,
): LocalStoreResult<T> {
  const store = resolveStorage(storage)
  try {
    const raw = store.getItem(LOCAL_STORE_KEY)
    if (raw === null) {
      return { ok: true, data: empty() }
    }
    const parsed: unknown = JSON.parse(raw)
    return { ok: true, data: parse(parsed) }
  } catch {
    return {
      ok: false,
      error: 'corrupt',
      messageDe: 'Lokale Daten sind beschädigt und wurden nicht geladen.',
    }
  }
}

export function writeJsonStore<T>(data: T, storage?: StorageLike): LocalStoreResult<T> {
  const store = resolveStorage(storage)
  try {
    store.setItem(LOCAL_STORE_KEY, JSON.stringify(data))
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      error: 'unavailable',
      messageDe: 'Lokale Speicherung ist nicht verfügbar.',
    }
  }
}

export function clearLocalStore(storage?: StorageLike): void {
  resolveStorage(storage).removeItem(LOCAL_STORE_KEY)
}
