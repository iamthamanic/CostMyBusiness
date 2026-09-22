/**
 * Pure helpers documenting RLS intent (cross-user deny) for Vitest without a live DB.
 * Location: src/integrations/supabase/rls-policy.ts
 */

export type OwnerRow = { owner_id: string }

/** Mirrors SQL: using (owner_id = auth.uid()) / with check (owner_id = auth.uid()) */
export function rlsAllowsOwner(row: OwnerRow, authUid: string | null): boolean {
  if (!authUid) return false
  return row.owner_id === authUid
}

export function filterVisibleRows<T extends OwnerRow>(rows: T[], authUid: string | null): T[] {
  return rows.filter((row) => rlsAllowsOwner(row, authUid))
}
