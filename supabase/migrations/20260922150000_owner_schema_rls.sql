-- CostMyBusiness V1 owner-scoped schema + RLS
-- Location: supabase/migrations/20260922150000_owner_schema_rls.sql

create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Persönlich',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  default_currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  currency text not null default 'EUR',
  price numeric,
  template_id text not null default 'custom',
  template_version integer,
  included_optional_keys jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funnels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'marketing',
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  base text not null default 'actual',
  overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.period_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  context text not null,
  period text not null default 'Month',
  values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.models enable row level security;
alter table public.funnels enable row level security;
alter table public.scenarios enable row level security;
alter table public.custom_templates enable row level security;
alter table public.period_values enable row level security;

-- Deny-by-default: only owner_id = auth.uid() policies (no anon policies)

create policy workspaces_owner_all on public.workspaces
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy businesses_owner_all on public.businesses
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy products_owner_all on public.products
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy models_owner_all on public.models
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy funnels_owner_all on public.funnels
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy scenarios_owner_all on public.scenarios
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy custom_templates_owner_all on public.custom_templates
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy period_values_owner_all on public.period_values
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
