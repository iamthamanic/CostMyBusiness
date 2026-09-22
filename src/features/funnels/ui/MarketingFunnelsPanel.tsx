/**
 * Marketing funnel editor panel for a product (stages, spend, derived metrics).
 * Location: src/features/funnels/ui/MarketingFunnelsPanel.tsx
 */
import { useEffect, useState } from 'react'
import { useRepos } from '@/app/providers/ReposProvider'
import { GlossaryHelp } from '@/features/glossary'
import { Button, Field } from '@/shared/ui'
import { calculateMarketingMetrics, type FunnelMetricValue } from '../application/calculate-marketing-metrics'
import type { MarketingFunnel } from '../domain/marketing-funnel'

type Props = {
  productId: string
}

export function MarketingFunnelsPanel({ productId }: Props) {
  const repos = useRepos()
  const [funnels, setFunnels] = useState<MarketingFunnel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('Google Generic')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = funnels.find((f) => f.id === selectedId) ?? funnels[0] ?? null

  useEffect(() => {
    void reload()
  }, [productId])

  async function reload() {
    const list = await repos.funnels.listByProduct(productId)
    setFunnels(list)
    if (list.length > 0 && !list.some((f) => f.id === selectedId)) {
      setSelectedId(list[0]!.id)
    }
    if (list.length === 0) setSelectedId(null)
  }

  async function onCreate() {
    setError(null)
    if (!name.trim()) {
      setError('Bitte einen Funnel-Namen angeben.')
      return
    }
    setSaving(true)
    try {
      const created = await repos.funnels.createMarketing({
        productId,
        name: name.trim(),
      })
      setName('Google Generic')
      await reload()
      setSelectedId(created.id)
    } catch {
      setError('Funnel konnte nicht angelegt werden.')
    } finally {
      setSaving(false)
    }
  }

  async function patchSelected(patch: {
    stages?: MarketingFunnel['stages']
    costs?: Partial<MarketingFunnel['costs']>
    name?: string
  }) {
    if (!selected) return
    setError(null)
    try {
      const updated = await repos.funnels.update(selected.id, patch)
      setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      setError('Änderungen konnten nicht gespeichert werden.')
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('Marketing-Funnel wirklich löschen?')
    if (!ok) return
    await repos.funnels.delete(id)
    await reload()
  }

  const metrics = selected ? calculateMarketingMetrics(selected) : null

  return (
    <section className="flex flex-col gap-4 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <header>
        <h2 className="text-lg font-medium">Marketing-Funnels</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Stages, Media-Spend und Betriebskosten — Media-CPA getrennt vom Fully-loaded CAC.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-2">
        <Field
          label="Neuer Funnel"
          name="funnelName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Google Generic"
        />
        <Button onClick={() => void onCreate()} disabled={saving}>
          {saving ? 'Speichert…' : 'Funnel anlegen'}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          {error}
        </p>
      ) : null}

      {funnels.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-muted)]">Noch kein Marketing-Funnel für dieses Produkt.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {funnels.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={selected?.id === f.id}
              onClick={() => setSelectedId(f.id)}
              className={`rounded-md px-3 py-2 text-sm ${
                selected?.id === f.id
                  ? 'bg-[color:var(--accent-analysis)] text-white'
                  : 'border border-[color:var(--line-default)] bg-white'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {selected && metrics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Field
              label="Name"
              name="selectedFunnelName"
              value={selected.name}
              onChange={(e) => void patchSelected({ name: e.target.value })}
            />
            <StageField
              label="Impressionen"
              value={String(selected.stages.find((s) => s.key === 'impressions')?.count ?? '')}
              onChange={(v) => {
                const stages = selected.stages.map((s) =>
                  s.key === 'impressions' ? { ...s, count: Number(v) || 0 } : s,
                )
                void patchSelected({ stages })
              }}
            />
            <StageField
              label="Klicks"
              value={String(selected.stages.find((s) => s.key === 'clicks')?.count ?? '')}
              onChange={(v) => {
                const stages = selected.stages.map((s) =>
                  s.key === 'clicks' ? { ...s, count: Number(v) || 0 } : s,
                )
                void patchSelected({ stages })
              }}
            />
            <StageField
              label="Conversions"
              value={String(selected.stages.find((s) => s.key === 'conversions')?.count ?? '')}
              onChange={(v) => {
                const stages = selected.stages.map((s) =>
                  s.key === 'conversions' ? { ...s, count: Number(v) || 0 } : s,
                )
                void patchSelected({ stages })
              }}
            />
            <StageField
              label="Media-Spend (EUR)"
              value={String(selected.costs.mediaSpend)}
              onChange={(v) => void patchSelected({ costs: { mediaSpend: Number(v) || 0 } })}
            />
            <StageField
              label="Agentur (EUR)"
              value={String(selected.costs.agency)}
              onChange={(v) => void patchSelected({ costs: { agency: Number(v) || 0 } })}
            />
            <StageField
              label="Personal (EUR)"
              value={String(selected.costs.personnel)}
              onChange={(v) => void patchSelected({ costs: { personnel: Number(v) || 0 } })}
            />
            <StageField
              label="Tools (EUR)"
              value={String(selected.costs.tools)}
              onChange={(v) => void patchSelected({ costs: { tools: Number(v) || 0 } })}
            />
            <Button variant="danger" onClick={() => void onDelete(selected.id)}>
              Funnel löschen
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-md border border-[color:var(--line-default)] bg-white p-3">
            <p className="text-sm font-medium">Kennzahlen</p>
            <MetricRow label="CTR" termId="ctr" metric={metrics.ctr} format="pct" />
            <MetricRow label="CVR" termId="cvr" metric={metrics.cvr} format="pct" />
            <MetricRow label="CPC" termId="cpc" metric={metrics.cpc} format="eur" />
            <MetricRow label="Media-CPA" termId="cpa" metric={metrics.mediaCpa} format="eur" />
            <MetricRow label="Media-CAC" termId="cac" metric={metrics.mediaCac} format="eur" />
            <MetricRow
              label="Fully-loaded CAC"
              termId="cac"
              metric={metrics.fullyLoadedCac}
              format="eur"
            />
            <p className="mt-2 text-xs text-[color:var(--ink-muted)]">
              Media-Spend {metrics.mediaSpend.toFixed(2)} EUR · Betriebskosten{' '}
              {metrics.operatingCosts.toFixed(2)} EUR · Fully-loaded{' '}
              {metrics.fullyLoadedSpend.toFixed(2)} EUR
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function StageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field
      label={label}
      name={label}
      type="number"
      min={0}
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function MetricRow({
  label,
  termId,
  metric,
  format,
}: {
  label: string
  termId: string
  metric: FunnelMetricValue
  format: 'eur' | 'pct'
}) {
  let display: string
  if (metric.status === 'ok') {
    display =
      format === 'pct' ? `${(metric.value * 100).toFixed(2)} %` : `${metric.value.toFixed(2)} EUR`
  } else {
    display = 'Unvollständig'
  }
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="flex items-center text-[color:var(--ink-muted)]">
        {label}
        <GlossaryHelp termId={termId} />
        {metric.status === 'ok' ? (
          <span className="ml-2 text-[10px] uppercase tracking-wide text-[color:var(--ink-muted)]">
            {metric.scope === 'media_only'
              ? 'media-only'
              : metric.scope === 'fully_loaded'
                ? 'fully-loaded'
                : ''}
          </span>
        ) : null}
      </span>
      <span className="text-right font-medium tabular-nums">
        {display}
        {metric.status === 'unresolved' ? (
          <span className="mt-0.5 block text-xs font-normal text-[color:var(--semantic-cost)]">
            {metric.messageDe}
          </span>
        ) : null}
      </span>
    </div>
  )
}
