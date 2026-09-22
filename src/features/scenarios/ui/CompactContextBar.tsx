/**
 * Compact scenario + period controls for the product calculator header.
 * Location: src/features/scenarios/ui/CompactContextBar.tsx
 */
import { useEffect, useState } from 'react'
import { useRepos } from '@/app/providers/ReposProvider'
import { PERIOD_TYPES, type PeriodType } from '@/core/periods'
import { resolveContext } from '../application/resolve-context'
import type { ProductPlanningState } from '../domain/planning'

type Props = {
  productId: string
  onResolvedValues?: (values: Record<string, number>) => void
}

export function CompactContextBar({ productId, onResolvedValues }: Props) {
  const repos = useRepos()
  const [state, setState] = useState<ProductPlanningState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const planning = await repos.planning.getForProduct(productId)
        setState(planning)
        setError(null)
        onResolvedValues?.(resolveContext(planning).values)
      } catch {
        setError('Kontext konnte nicht geladen werden.')
      }
    })()
  }, [productId, repos.planning, onResolvedValues])

  if (error) {
    return (
      <p className="text-sm text-[color:var(--semantic-cost)]" role="alert">
        {error}
      </p>
    )
  }
  if (!state) {
    return <p className="text-sm text-[color:var(--ink-muted)]" aria-busy="true">Kontext…</p>
  }

  const options: Array<{ id: string; label: string }> = [
    { id: 'actual', label: 'Actual' },
    { id: 'budget', label: 'Budget' },
    ...state.scenarios.map((s) => ({ id: s.id, label: s.name })),
  ]

  return (
    <div className="flex flex-wrap items-end gap-3" data-testid="compact-context-bar">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Szenario</span>
        <select
          className="min-w-[10rem] rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
          value={state.activeContextId}
          aria-label="Szenario"
          onChange={(e) => {
            void (async () => {
              const next = await repos.planning.setActiveContext(productId, e.target.value)
              setState(next)
              onResolvedValues?.(resolveContext(next).values)
            })()
          }}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Zeitraum</span>
        <select
          className="min-w-[8rem] rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
          value={state.period}
          aria-label="Zeitraum"
          onChange={(e) => {
            void (async () => {
              const next = await repos.planning.setPeriod(
                productId,
                e.target.value as PeriodType,
              )
              setState(next)
              onResolvedValues?.(resolveContext(next).values)
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
  )
}
