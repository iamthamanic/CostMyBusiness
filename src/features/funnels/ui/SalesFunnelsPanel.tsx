/**
 * Sales funnel editor (B2B stages + sales acquisition cost).
 * Location: src/features/funnels/ui/SalesFunnelsPanel.tsx
 */
import { useEffect, useState } from 'react'
import { useRepos } from '@/app/providers/ReposProvider'
import { Button, Field } from '@/shared/ui'
import { calculateSalesMetrics } from '../application/calculate-sales-metrics'
import type { SalesFunnel } from '../domain/sales-funnel'

type Props = { productId: string }

export function SalesFunnelsPanel({ productId }: Props) {
  const repos = useRepos()
  const [funnels, setFunnels] = useState<SalesFunnel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('Outbound Sales')
  const [error, setError] = useState<string | null>(null)

  const selected = funnels.find((f) => f.id === selectedId) ?? funnels[0] ?? null

  async function reload() {
    const list = (await repos.funnels.listByProduct(productId)).filter(
      (f): f is SalesFunnel => f.type === 'sales',
    )
    setFunnels(list)
    if (list.length > 0 && !list.some((f) => f.id === selectedId)) setSelectedId(list[0]!.id)
    if (list.length === 0) setSelectedId(null)
  }

  useEffect(() => {
    void reload()
  }, [productId])

  async function patch(input: {
    stages?: SalesFunnel['stages']
    salesCosts?: Partial<SalesFunnel['costs']>
    name?: string
  }) {
    if (!selected) return
    const updated = await repos.funnels.update(selected.id, input)
    if (updated.type === 'sales') {
      setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    }
  }

  const metrics = selected ? calculateSalesMetrics(selected) : null

  return (
    <section className="flex flex-col gap-4 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <header>
        <h2 className="text-lg font-medium">Sales-Funnels</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Leads → MQL → SQL → Angebot → Gewonnen inkl. Sales-CAC.
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-2">
        <Field
          label="Neuer Sales-Funnel"
          name="salesName"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          onClick={() => {
            void (async () => {
              setError(null)
              try {
                const created = await repos.funnels.createSales({
                  productId,
                  name: name.trim() || 'Sales',
                })
                await reload()
                setSelectedId(created.id)
              } catch {
                setError('Sales-Funnel konnte nicht angelegt werden.')
              }
            })()
          }}
        >
          Anlegen
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {funnels.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={selected?.id === f.id}
            className={`rounded-md px-3 py-2 text-sm ${
              selected?.id === f.id
                ? 'bg-[color:var(--accent-analysis)] text-white'
                : 'border border-[color:var(--line-default)] bg-white'
            }`}
            onClick={() => setSelectedId(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>
      {selected && metrics ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Field
              label="Leads"
              name="leads"
              type="number"
              min={0}
              value={String(selected.stages.find((s) => s.key === 'leads')?.count ?? '')}
              onChange={(e) => {
                const stages = selected.stages.map((s) =>
                  s.key === 'leads' ? { ...s, count: Number(e.target.value) || 0 } : s,
                )
                void patch({ stages })
              }}
            />
            <Field
              label="Gewonnen"
              name="won"
              type="number"
              min={0}
              value={String(selected.stages.find((s) => s.key === 'won')?.count ?? '')}
              onChange={(e) => {
                const stages = selected.stages.map((s) =>
                  s.key === 'won' ? { ...s, count: Number(e.target.value) || 0 } : s,
                )
                void patch({ stages })
              }}
            />
            {(
              [
                ['personnel', 'Personal'],
                ['crm', 'CRM'],
                ['commission', 'Provision'],
                ['tools', 'Tools'],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={`${label} (EUR)`}
                name={key}
                type="number"
                min={0}
                value={String(selected.costs[key])}
                onChange={(e) =>
                  void patch({ salesCosts: { [key]: Number(e.target.value) || 0 } })
                }
              />
            ))}
          </div>
          <div className="rounded-md border border-[color:var(--line-default)] bg-white p-3 text-sm">
            <p className="font-medium">Sales-Kennzahlen</p>
            <p className="mt-2">
              Sales-CAC:{' '}
              {metrics.salesAcquisitionCost.status === 'ok'
                ? `${metrics.salesAcquisitionCost.value.toFixed(2)} EUR`
                : 'Unvollständig'}
            </p>
            {metrics.salesAcquisitionCost.status === 'unresolved' ? (
              <p className="text-xs text-[color:var(--semantic-cost)]">
                {metrics.salesAcquisitionCost.messageDe}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[color:var(--ink-muted)]">
              Fully-loaded Spend {metrics.fullyLoadedSpend.toFixed(2)} EUR
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[color:var(--ink-muted)]">Noch kein Sales-Funnel.</p>
      )}
    </section>
  )
}
