/**
 * Funnel profitability filter for the product workbench.
 * Location: src/features/funnels/ui/FunnelFilterPanel.tsx
 */
import { useEffect, useState } from 'react'
import { useRepos } from '@/app/providers/ReposProvider'
import type { DomainModel } from '@/core/model'
import {
  filterProfitabilityByFunnel,
  type ProductFunnel,
} from '../application/funnel-filter'

type Props = {
  productId: string
  model: DomainModel
}

export function FunnelFilterPanel({ productId, model }: Props) {
  const repos = useRepos()
  const [funnels, setFunnels] = useState<ProductFunnel[]>([])
  const [filterId, setFilterId] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setFunnels(await repos.funnels.listByProduct(productId))
    })()
  }, [productId])

  const selected = funnels.find((f) => f.id === filterId) ?? null
  const result = filterProfitabilityByFunnel(model, selected)

  return (
    <section className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <header>
        <h2 className="text-lg font-medium">Funnel-Filter</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Profitabilität einem Akquise-/Sales-Funnel zuordnen.
        </p>
      </header>
      <label className="flex max-w-md flex-col gap-1 text-sm">
        <span className="font-medium">Aktiver Funnel</span>
        <select
          className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
          value={filterId ?? ''}
          onChange={(e) => setFilterId(e.target.value || null)}
        >
          <option value="">Kein Filter</option>
          {funnels.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.type})
            </option>
          ))}
        </select>
      </label>
      {result.status === 'unresolved' ? (
        <p role="status" className="text-sm text-[color:var(--semantic-cost)]">
          {result.messageDe}
          {result.missing.length > 0 ? (
            <span className="mt-1 block text-xs">Fehlend: {result.missing.join(', ')}</span>
          ) : null}
        </p>
      ) : (
        <ul className="text-sm text-[color:var(--ink-muted)]">
          <li>{result.noteDe}</li>
          <li>
            Akquisekosten / Einheit: {result.acquisitionCostPerUnit.toFixed(2)} EUR
          </li>
          <li>
            Deckungsbeitrag / Einheit:{' '}
            {result.contributionPerUnit !== null
              ? `${result.contributionPerUnit.toFixed(2)} EUR`
              : 'Unvollständig'}
          </li>
        </ul>
      )}
    </section>
  )
}
