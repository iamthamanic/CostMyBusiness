/**
 * Result spine — direct → contribution → allocated → profit → margin.
 * Location: src/features/cost-graph/ui/ResultSpine.tsx
 */
import type { WorkbenchSpine } from '../application/project-workbench-view'

type Props = { spine: WorkbenchSpine }

function Cell({
  label,
  value,
  sub,
  tone = 'neutral',
  numericValue,
  testId,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'neutral' | 'cost' | 'profit' | 'result'
  numericValue?: number | null
  testId: string
}) {
  const negative = typeof numericValue === 'number' && numericValue < 0
  const effectiveTone = negative && (tone === 'profit' || tone === 'result') ? 'cost' : tone
  const border =
    effectiveTone === 'profit'
      ? 'border-[color:var(--semantic-profit)]'
      : effectiveTone === 'cost'
        ? 'border-[color:var(--semantic-cost)]/40'
        : effectiveTone === 'result'
          ? 'border-[color:var(--ink-primary)]'
          : 'border-[color:var(--line-default)]'
  const valueColor =
    effectiveTone === 'profit'
      ? 'text-[color:var(--semantic-profit)]'
      : effectiveTone === 'cost'
        ? 'text-[color:var(--semantic-cost)]'
        : 'text-[color:var(--ink-primary)]'

  return (
    <div
      className={`min-w-[140px] flex-1 rounded-[12px] border bg-[color:var(--surface-panel)] px-4 py-3 shadow-[0_1px_2px_rgba(23,32,51,0.05)] ${border}`}
      data-testid={testId}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
        {label}
      </p>
      <p className={`mt-1 font-variant-numeric text-xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-[color:var(--ink-muted)]">{sub}</p> : null}
    </div>
  )
}

function Arrow() {
  return (
    <span className="hidden shrink-0 self-center text-[color:var(--ink-muted)] md:inline" aria-hidden>
      →
    </span>
  )
}

function fmt(n: number | null, suffix = ' €'): string {
  if (n === null) return '—'
  return `${n.toFixed(2)}${suffix}`
}

function fmtPct(n: number | null): string {
  if (n === null) return '—'
  return `${n.toFixed(1)} %`
}

export function ResultSpine({ spine }: Props) {
  return (
    <div
      className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-stretch md:gap-2"
      data-testid="result-spine"
      role="region"
      aria-label="Ergebnis"
    >
      <Cell
        label="Total direkte Kosten"
        value={fmt(spine.directPerUnit)}
        sub={
          spine.netRevenuePerUnit && spine.directPerUnit !== null
            ? `${((spine.directPerUnit / spine.netRevenuePerUnit) * 100).toFixed(1)} % vom Netto`
            : '/ Auftrag'
        }
        tone="cost"
        numericValue={spine.directPerUnit}
        testId="spine-direct"
      />
      <Arrow />
      <Cell
        label="Deckungsbeitrag"
        value={fmt(spine.contributionPerUnit)}
        sub={fmtPct(spine.contributionMarginPercent)}
        tone="profit"
        numericValue={spine.contributionPerUnit}
        testId="spine-contribution"
      />
      <Arrow />
      <Cell
        label="Alloziierte Kosten"
        value={fmt(spine.allocatedPerUnit)}
        sub="/ Auftrag"
        tone="cost"
        numericValue={spine.allocatedPerUnit}
        testId="spine-allocated"
      />
      <Arrow />
      <Cell
        label="Gewinn"
        value={fmt(spine.profitPerUnit)}
        sub="Fully Loaded"
        tone="profit"
        numericValue={spine.profitPerUnit}
        testId="spine-profit"
      />
      <Arrow />
      <Cell
        label="Marge"
        value={fmtPct(spine.marginPercent)}
        sub="vom Nettoerlös"
        tone="result"
        numericValue={spine.marginPercent}
        testId="spine-margin"
      />
    </div>
  )
}
