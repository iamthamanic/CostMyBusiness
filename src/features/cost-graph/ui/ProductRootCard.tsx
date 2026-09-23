/**
 * Product root calculator — name, basis, selling price / VAT / net revenue.
 * Location: src/features/cost-graph/ui/ProductRootCard.tsx
 */
import { useEffect, useState } from 'react'
import type { PriceKind, PricingBasis, Product } from '@/features/products'
import { resolveNetRevenue } from '@/core/pricing'

type ProductPatch = {
  name?: string
  sellingPrice?: number
  taxRatePercent?: number
  priceKind?: PriceKind
  pricingBasis?: PricingBasis
  currency?: string
}

type Props = {
  product: Product
  onPricingChange: (patch: ProductPatch) => void
}

export function ProductRootCard({ product, onPricingChange }: Props) {
  const [nameDraft, setNameDraft] = useState(product.name)

  useEffect(() => {
    setNameDraft(product.name)
  }, [product.name])

  const pricing = resolveNetRevenue({
    sellingPrice: product.sellingPrice,
    priceKind: product.priceKind,
    taxRatePercent: product.taxRatePercent,
    pricingBasis: product.pricingBasis,
    currency: product.currency,
  })

  function commitName() {
    const next = nameDraft.trim() || 'Neues Produkt'
    if (next !== product.name) onPricingChange({ name: next })
    else setNameDraft(product.name)
  }

  return (
    <div
      className="w-full max-w-lg rounded-[16px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-5 shadow-[0_2px_8px_rgba(23,32,51,0.06)]"
      data-testid="product-root"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eefc] text-sm font-bold text-[color:var(--accent-analysis)]"
          aria-hidden
        >
          P
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--ink-muted)]">
            Produkt
          </p>
          <input
            className="mt-0.5 w-full min-w-0 rounded-md border border-[color:var(--line-default)] bg-white px-2 py-1 text-xl font-semibold tracking-tight text-[color:var(--ink-primary)]"
            value={nameDraft}
            aria-label="Produktname"
            data-testid="product-root-name"
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <select
              className="h-8 rounded-md border border-[color:var(--line-default)] bg-white px-2 text-sm text-[color:var(--ink-muted)]"
              value={product.pricingBasis}
              aria-label="Preisbasis"
              data-testid="product-root-basis"
              onChange={(e) =>
                onPricingChange({ pricingBasis: e.target.value as PricingBasis })
              }
            >
              <option value="per_order">pro Auftrag</option>
              <option value="per_unit">pro Einheit</option>
              <option value="per_customer">pro Kunde</option>
              <option value="per_month">pro Monat</option>
            </select>
            <span className="text-sm text-[color:var(--ink-muted)]" aria-hidden>
              ·
            </span>
            <select
              className="h-8 rounded-md border border-[color:var(--line-default)] bg-white px-2 text-sm text-[color:var(--ink-muted)]"
              value={product.currency}
              aria-label="Währung"
              data-testid="product-root-currency"
              onChange={(e) => onPricingChange({ currency: e.target.value })}
            >
              <option value="EUR">EUR</option>
              <option value="CHF">CHF</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Verkaufspreis {product.priceKind === 'gross' ? 'brutto' : 'netto'}
          </span>
          <input
            className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2 font-variant-numeric tabular-nums"
            type="number"
            step="0.01"
            min={0}
            value={product.sellingPrice}
            aria-label="Verkaufspreis"
            data-testid="product-root-price"
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!Number.isFinite(n) || n < 0) return
              onPricingChange({ sellingPrice: n })
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">MwSt. Satz</span>
          <input
            className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2 font-variant-numeric tabular-nums"
            type="number"
            step="0.01"
            min={0}
            max={99.99}
            value={product.taxRatePercent}
            aria-label="MwSt. Satz"
            data-testid="product-root-vat"
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!Number.isFinite(n) || n < 0 || n >= 100) return
              onPricingChange({ taxRatePercent: n })
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Preisart</span>
          <select
            className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
            value={product.priceKind}
            aria-label="Preisart"
            onChange={(e) =>
              onPricingChange({ priceKind: e.target.value as PriceKind })
            }
          >
            <option value="gross">Brutto</option>
            <option value="net">Netto</option>
          </select>
        </label>
      </div>

      <div
        className="mt-4 rounded-lg border border-[#c5d0ea] bg-[#eef2fb] px-4 py-3"
        data-testid="product-root-net"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--accent-analysis)]">
          Nettoerlös (für Kalkulation)
        </p>
        {pricing.status === 'ok' ? (
          <p className="mt-1 font-variant-numeric text-2xl font-semibold tabular-nums text-[color:var(--ink-primary)]">
            {pricing.netRevenue.toFixed(2)} €
          </p>
        ) : (
          <p className="mt-1 text-sm text-[color:var(--semantic-warning)]" role="status">
            {pricing.messageDe}
          </p>
        )}
        <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
          USt ist Preisnormalisierung — keine Kostenposition
        </p>
      </div>
    </div>
  )
}
