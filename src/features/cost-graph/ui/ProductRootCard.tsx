/**
 * Product root calculator — selling price / VAT / net revenue.
 * Location: src/features/cost-graph/ui/ProductRootCard.tsx
 */
import type { Product } from '@/features/products'
import { resolveNetRevenue } from '@/core/pricing'

type Props = {
  product: Product
  onPricingChange: (patch: {
    sellingPrice?: number
    taxRatePercent?: number
    priceKind?: 'gross' | 'net'
  }) => void
}

export function ProductRootCard({ product, onPricingChange }: Props) {
  const pricing = resolveNetRevenue({
    sellingPrice: product.sellingPrice,
    priceKind: product.priceKind,
    taxRatePercent: product.taxRatePercent,
    pricingBasis: product.pricingBasis,
    currency: product.currency,
  })

  return (
    <div
      className="mx-auto w-full max-w-xl rounded-[14px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(23,32,51,0.06)]"
      data-testid="product-root"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ink-muted)]">
        Produkt
      </p>
      <h2 className="mt-1 text-xl font-semibold text-[color:var(--ink-primary)]">{product.name}</h2>
      <p className="mt-0.5 text-sm text-[color:var(--ink-muted)]">
        {product.pricingBasis === 'per_order'
          ? 'pro Auftrag'
          : product.pricingBasis === 'per_customer'
            ? 'pro Kunde'
            : product.pricingBasis === 'per_month'
              ? 'pro Monat'
              : 'pro Einheit'}{' '}
        · {product.currency}
      </p>

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
              onPricingChange({ priceKind: e.target.value as 'gross' | 'net' })
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
