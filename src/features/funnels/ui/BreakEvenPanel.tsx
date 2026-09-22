/**
 * Break-even panel — formula + inputs via core breakEvenUnits.
 * Location: src/features/funnels/ui/BreakEvenPanel.tsx
 */
import { useState } from 'react'
import { breakEvenUnits } from '@/core/allocation'
import { Field } from '@/shared/ui'

export function BreakEvenPanel() {
  const [fixedCost, setFixedCost] = useState('1000')
  const [contributionPerUnit, setContributionPerUnit] = useState('25')

  const result = breakEvenUnits({
    fixedCost: Number(fixedCost),
    contributionPerUnit: Number(contributionPerUnit),
  })

  return (
    <section className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <header>
        <h2 className="text-lg font-medium">Break-even</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Formel: fixedCost / contributionPerUnit
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Fixkosten (EUR / Periode)"
          name="fixedCost"
          type="number"
          min={0}
          value={fixedCost}
          onChange={(e) => setFixedCost(e.target.value)}
        />
        <Field
          label="Deckungsbeitrag / Einheit (EUR)"
          name="contributionPerUnit"
          type="number"
          step="0.01"
          value={contributionPerUnit}
          onChange={(e) => setContributionPerUnit(e.target.value)}
        />
      </div>
      {result.status === 'ok' ? (
        <p className="text-sm">
          Break-even-Menge: <strong className="tabular-nums">{result.units.toFixed(2)}</strong>{' '}
          Einheiten
          <span className="mt-1 block text-xs text-[color:var(--ink-muted)]">
            Inputs: Fixkosten {result.inputs.fixedCost} · DB/Einheit{' '}
            {result.inputs.contributionPerUnit} · Formel {result.formula}
          </span>
        </p>
      ) : (
        <p role="status" className="text-sm text-[color:var(--semantic-cost)]">
          Unvollständig: {result.message}
          <span className="mt-1 block text-xs">
            Benötigt: positive finite Fixkosten und Deckungsbeitrag pro Einheit.
          </span>
        </p>
      )}
    </section>
  )
}
