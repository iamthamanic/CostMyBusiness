-- Product pricing SoR columns (gross/net, VAT, basis). price remains selling-price mirror.
-- Location: supabase/migrations/20260922172000_product_pricing.sql

alter table public.products
  add column if not exists price_kind text not null default 'gross'
    check (price_kind in ('gross', 'net'));

alter table public.products
  add column if not exists tax_rate_percent numeric not null default 0
    check (tax_rate_percent >= 0 and tax_rate_percent < 100);

alter table public.products
  add column if not exists pricing_basis text not null default 'per_unit'
    check (pricing_basis in ('per_order', 'per_unit', 'per_customer', 'per_month'));
