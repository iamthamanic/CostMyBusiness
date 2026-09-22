/**
 * Workbench chrome: Actual/Budget/Scenario context + period switcher.
 * Location: src/features/scenarios/ui/ContextPeriodChrome.tsx
 */
import { useEffect, useState } from 'react'
import { useRepos } from '@/app/providers/ReposProvider'
import { PERIOD_TYPES, type PeriodType } from '@/core/periods'
import { Button, Field } from '@/shared/ui'
import { resolveContext } from '../application/resolve-context'
import type { ProductPlanningState } from '../domain/planning'

type Props = {
  productId: string
  onStateChange?: (state: ProductPlanningState) => void
}

export function ContextPeriodChrome({ productId, onStateChange }: Props) {
  const repos = useRepos()
  const [state, setState] = useState<ProductPlanningState | null>(null)
  const [scenarioName, setScenarioName] = useState('CVR +10%')
  const [overrideKey, setOverrideKey] = useState('funnel.cvr')
  const [overrideValue, setOverrideValue] = useState('0.11')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const planning = await repos.planning.getForProduct(productId)
      setState(planning)
      onStateChange?.(planning)
    })()
  }, [productId])

  async function refresh(next: ProductPlanningState) {
    setState(next)
    onStateChange?.(next)
  }

  if (!state) return <p aria-busy="true">Kontext lädt…</p>

  const resolved = resolveContext(state)
  const activeScenario =
    state.activeContextId !== 'actual' && state.activeContextId !== 'budget'
      ? state.scenarios.find((s) => s.id === state.activeContextId)
      : null

  return (
    <section className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Kontext & Periode</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">
            Actual / Budget / Scenario — Overrides ändern andere Kontexte nicht.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Periode</span>
          <select
            className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
            value={state.period}
            onChange={(e) => {
              void (async () => {
                const next = await repos.planning.setPeriod(
                  productId,
                  e.target.value as PeriodType,
                )
                await refresh(next)
              })()
            }}
          >
            {PERIOD_TYPES.map((p) => (
              <option key={p} value={p}>
                {p === 'Day'
                  ? 'Tag'
                  : p === 'Week'
                    ? 'Woche'
                    : p === 'Month'
                      ? 'Monat'
                      : p === 'Quarter'
                        ? 'Quartal'
                        : 'Jahr'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['actual', 'budget'] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={state.activeContextId === id}
            className={`rounded-md px-3 py-2 text-sm ${
              state.activeContextId === id
                ? 'bg-[color:var(--accent-analysis)] text-white'
                : 'border border-[color:var(--line-default)] bg-white'
            }`}
            onClick={() => {
              void (async () => {
                const next = await repos.planning.setActiveContext(productId, id)
                await refresh(next)
              })()
            }}
          >
            {id === 'actual' ? 'Actual' : 'Budget'}
          </button>
        ))}
        {state.scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={state.activeContextId === s.id}
            className={`rounded-md px-3 py-2 text-sm ${
              state.activeContextId === s.id
                ? 'bg-[color:var(--accent-analysis)] text-white'
                : 'border border-[color:var(--line-default)] bg-white'
            }`}
            onClick={() => {
              void (async () => {
                const next = await repos.planning.setActiveContext(productId, s.id)
                await refresh(next)
              })()
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Field
          label="Actual CVR"
          name="actualCvr"
          type="number"
          step="0.01"
          min={0}
          value={String(state.actualValues['funnel.cvr'] ?? '')}
          onChange={(e) => {
            void (async () => {
              const next = await repos.planning.setBaseValue(
                productId,
                'actual',
                'funnel.cvr',
                Number(e.target.value) || 0,
              )
              await refresh(next)
            })()
          }}
        />
        <Field
          label="Budget CVR"
          name="budgetCvr"
          type="number"
          step="0.01"
          min={0}
          value={String(state.budgetValues['funnel.cvr'] ?? '')}
          onChange={(e) => {
            void (async () => {
              const next = await repos.planning.setBaseValue(
                productId,
                'budget',
                'funnel.cvr',
                Number(e.target.value) || 0,
              )
              await refresh(next)
            })()
          }}
        />
        <div className="flex flex-col gap-2">
          <Field
            label="Neues Szenario"
            name="scenarioName"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <Button
            onClick={() => {
              void (async () => {
                setError(null)
                try {
                  const { state: next } = await repos.planning.createScenario(productId, {
                    name: scenarioName.trim() || 'Szenario',
                    base: 'actual',
                  })
                  await refresh(next)
                } catch (err) {
                  setError(
                    err instanceof Error && 'messageDe' in err
                      ? String((err as { messageDe: string }).messageDe)
                      : 'Szenario konnte nicht angelegt werden.',
                  )
                }
              })()
            }}
          >
            Szenario anlegen
          </Button>
        </div>
      </div>

      {activeScenario ? (
        <div className="rounded-md border border-dashed border-[color:var(--line-default)] p-3">
          <p className="mb-2 text-sm font-medium">
            Overrides für „{activeScenario.name}“ (Basis: {activeScenario.base})
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            <Field
              label="Schlüssel"
              name="overrideKey"
              value={overrideKey}
              onChange={(e) => setOverrideKey(e.target.value)}
            />
            <Field
              label="Wert"
              name="overrideValue"
              type="number"
              step="0.01"
              value={overrideValue}
              onChange={(e) => setOverrideValue(e.target.value)}
            />
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  void (async () => {
                    const next = await repos.planning.setScenarioOverride(
                      productId,
                      activeScenario.id,
                      overrideKey,
                      Number(overrideValue) || 0,
                    )
                    await refresh(next)
                  })()
                }}
              >
                Override setzen
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  void (async () => {
                    const next = await repos.planning.removeScenarioOverride(
                      productId,
                      activeScenario.id,
                      overrideKey,
                    )
                    await refresh(next)
                  })()
                }}
              >
                Entfernen
              </Button>
            </div>
          </div>
          <ul className="mt-2 text-sm text-[color:var(--ink-muted)]">
            {Object.entries(activeScenario.overrides).map(([k, v]) => (
              <li key={k}>
                {k} = {v}
              </li>
            ))}
            {Object.keys(activeScenario.overrides).length === 0 ? (
              <li>Keine Overrides — Werte werden geerbt.</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          {error}
        </p>
      ) : null}

      <div className="text-sm">
        <p className="font-medium">Aufgelöste Werte ({state.activeContextId})</p>
        <ul className="mt-1 text-[color:var(--ink-muted)]">
          {Object.keys(resolved.values).length === 0 ? (
            <li>Noch keine Werte</li>
          ) : (
            Object.entries(resolved.values).map(([k, v]) => {
              const entry = resolved.entries.find((e) => e.key === k)
              return (
                <li key={k}>
                  {k} = {v}
                  {entry ? ` · Quelle: ${entry.source}` : ''}
                </li>
              )
            })
          )}
        </ul>
        {resolved.orphans.length > 0 ? (
          <p className="mt-2 text-[color:var(--semantic-cost)]" role="status">
            Verwaiste Overrides ausgeschlossen:{' '}
            {resolved.orphans.map((o) => o.key).join(', ')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
