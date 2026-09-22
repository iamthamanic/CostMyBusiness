/**
 * Browser Supabase client — anon key only, never service role.
 * Location: src/integrations/supabase/client.ts
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type BusinessRow = {
  id: string
  workspace_id: string
  owner_id: string
  name: string
  default_currency: string
  created_at: string
  updated_at: string
}

type ProductRow = {
  id: string
  business_id: string
  owner_id: string
  name: string
  currency: string
  price: number | null
  price_kind: 'gross' | 'net'
  tax_rate_percent: number
  pricing_basis: 'per_order' | 'per_unit' | 'per_customer' | 'per_month'
  template_id: string
  template_version: number | null
  included_optional_keys: Json
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: BusinessRow
        Insert: {
          id?: string
          workspace_id: string
          owner_id: string
          name: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          owner_id?: string
          name?: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: ProductRow
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          name: string
          currency?: string
          price?: number | null
          price_kind?: 'gross' | 'net'
          tax_rate_percent?: number
          pricing_basis?: 'per_order' | 'per_unit' | 'per_customer' | 'per_month'
          template_id?: string
          template_version?: number | null
          included_optional_keys?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          name?: string
          currency?: string
          price?: number | null
          price_kind?: 'gross' | 'net'
          tax_rate_percent?: number
          pricing_basis?: 'per_order' | 'per_unit' | 'per_customer' | 'per_month'
          template_id?: string
          template_version?: number | null
          included_optional_keys?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type AppSupabaseClient = SupabaseClient<Database>

export function readSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function createBrowserSupabaseClient(): AppSupabaseClient | null {
  const env = readSupabaseEnv()
  if (!env) return null
  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
