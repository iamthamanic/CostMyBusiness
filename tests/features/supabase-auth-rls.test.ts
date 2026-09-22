import { describe, expect, it } from 'vitest'
import { filterVisibleRows, rlsAllowsOwner } from '@/integrations/supabase'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('supabase RLS policy intent', () => {
  it('denies anon (null uid) and cross-user rows', () => {
    const row = { owner_id: 'user-a' }
    expect(rlsAllowsOwner(row, null)).toBe(false)
    expect(rlsAllowsOwner(row, 'user-b')).toBe(false)
    expect(rlsAllowsOwner(row, 'user-a')).toBe(true)
  })

  it('filters visible rows to owner only', () => {
    const rows = [
      { owner_id: 'user-a', id: '1' },
      { owner_id: 'user-b', id: '2' },
    ]
    expect(filterVisibleRows(rows, 'user-a').map((r) => r.id)).toEqual(['1'])
    expect(filterVisibleRows(rows, null)).toEqual([])
  })

  it('migration enables RLS and owner policies without service role references', () => {
    const sql = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260922150000_owner_schema_rls.sql'),
      'utf8',
    )
    expect(sql).toMatch(/enable row level security/i)
    expect(sql).toMatch(/owner_id = auth\.uid\(\)/)
    expect(sql.toLowerCase()).not.toContain('service_role')
  })
})
