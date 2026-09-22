/**
 * Editable inspector for cost/revenue nodes — live recalculation via onModelChange.
 * Location: src/features/cost-graph/ui/InspectorPanel.tsx
 */
import { useEffect, useState } from 'react'
import { FormulaError, parseFormula } from '@/core/formulas'
import type { CostBehavior, DomainModel, NodeResult } from '@/core/model'
import { getLayerGuidance, LayerGuidancePanel } from '@/features/templates'
import { Button, Field } from '@/shared/ui'
import {
  COST_BEHAVIOR_OPTIONS,
  duplicateNode,
  isOptionalCostNode,
  removeNode,
  updateNodeBehavior,
  updateNodeEnabled,
  updateNodeFormula,
  updateNodeInputs,
  updateNodeLabel,
} from '../application/mutate-model'

type Props = {
  model: DomainModel
  selectedNodeId: string | null
  results: Record<string, NodeResult>
  onModelChange: (next: DomainModel) => void
  onSelectNode: (nodeId: string | null) => void
  templateId?: string
}

export function InspectorPanel({
  model,
  selectedNodeId,
  results,
  onModelChange,
  onSelectNode,
  templateId,
}: Props) {
  if (!selectedNodeId) {
    return (
      <aside className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
        <h2 className="text-lg font-medium">Inspector</h2>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Wählen Sie einen Knoten, um die Herleitung zu sehen und zu bearbeiten.
        </p>
      </aside>
    )
  }

  const node = model.nodes.find((n) => n.id === selectedNodeId)
  const result = results[selectedNodeId]
  if (!node) {
    return (
      <aside className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
        <p role="alert">Knoten nicht gefunden.</p>
      </aside>
    )
  }

  const optional = isOptionalCostNode(node)
  const behaviorMeta = COST_BEHAVIOR_OPTIONS.find((o) => o.value === node.costBehavior)
  const resolvedLayerKey =
    node.key === 'g_operations'
      ? 'operations'
      : node.key === 'g_acquisition'
        ? 'acquisition'
        : undefined
  const guidance =
    templateId && resolvedLayerKey ? getLayerGuidance(templateId, resolvedLayerKey) : null

  return (
    <aside className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
      <h2 className="text-lg font-medium">Inspector</h2>

      {guidance ? <LayerGuidancePanel layerLabel={node.label} guidance={guidance} /> : null}

      <Field
        label="Name"
        name="nodeLabel"
        value={node.label}
        onChange={(e) => onModelChange(updateNodeLabel(model, node.id, e.target.value))}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={node.enabled}
          onChange={(e) => onModelChange(updateNodeEnabled(model, node.id, e.target.checked))}
        />
        Aktiv
      </label>

      {node.kind === 'cost' ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Kostenverhalten</span>
          <select
            className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
            value={node.costBehavior ?? 'per_order'}
            onChange={(e) =>
              onModelChange(updateNodeBehavior(model, node.id, e.target.value as CostBehavior))
            }
          >
            {COST_BEHAVIOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelDe}
              </option>
            ))}
          </select>
          {behaviorMeta ? (
            <span className="text-xs text-[color:var(--ink-muted)]">Einheit/Basis: {behaviorMeta.unitHint}</span>
          ) : null}
        </label>
      ) : null}

      {node.kind === 'revenue' ? (
        <Field
          label="Preis"
          name="price"
          type="number"
          step="0.01"
          min={0}
          value={String(node.inputs.price ?? 0)}
          hint="EUR / Stück"
          onChange={(e) =>
            onModelChange(updateNodeInputs(model, node.id, { price: Number(e.target.value) }))
          }
        />
      ) : null}

      {node.kind === 'cost' && node.costBehavior === 'fixed_period' ? (
        <Field
          label="Betrag"
          name="amount"
          type="number"
          step="0.01"
          value={String(node.inputs.amount ?? 0)}
          hint="EUR / Periode"
          onChange={(e) =>
            onModelChange(updateNodeInputs(model, node.id, { amount: Number(e.target.value) }))
          }
        />
      ) : null}

      {node.kind === 'cost' && node.costBehavior === 'per_hour' ? (
        <>
          <Field
            label="Stundensatz"
            name="rate"
            type="number"
            step="0.01"
            value={String(node.inputs.rate ?? 0)}
            hint="EUR / Stunde"
            onChange={(e) =>
              onModelChange(updateNodeInputs(model, node.id, { rate: Number(e.target.value) }))
            }
          />
          <Field
            label="Stunden pro Auftrag"
            name="hoursPerOrder"
            type="number"
            step="0.01"
            value={String(node.inputs.hoursPerOrder ?? 0)}
            hint="Stunden / Auftrag"
            onChange={(e) =>
              onModelChange(
                updateNodeInputs(model, node.id, { hoursPerOrder: Number(e.target.value) }),
              )
            }
          />
        </>
      ) : null}

      {node.kind === 'cost' &&
      node.costBehavior &&
      node.costBehavior !== 'fixed_period' &&
      node.costBehavior !== 'per_hour' &&
      node.costBehavior !== 'percentage_revenue' &&
      node.costBehavior !== 'custom_formula' ? (
        <Field
          label="Satz"
          name="rate"
          type="number"
          step="0.01"
          value={String(node.inputs.rate ?? 0)}
          hint={behaviorMeta?.unitHint ?? 'EUR'}
          onChange={(e) =>
            onModelChange(updateNodeInputs(model, node.id, { rate: Number(e.target.value) }))
          }
        />
      ) : null}

      {node.kind === 'cost' && node.costBehavior === 'percentage_revenue' ? (
        <>
          <Field
            label="Prozent"
            name="percentage"
            type="number"
            step="0.01"
            value={String(node.inputs.percentage ?? 0)}
            hint="% vom Umsatz"
            onChange={(e) =>
              onModelChange(
                updateNodeInputs(model, node.id, { percentage: Number(e.target.value) }),
              )
            }
          />
          <Field
            label="Umsatz pro Stück (Bezug)"
            name="revenuePerUnit"
            type="number"
            step="0.01"
            value={String(node.inputs.revenuePerUnit ?? 0)}
            hint="EUR / Stück"
            onChange={(e) =>
              onModelChange(
                updateNodeInputs(model, node.id, { revenuePerUnit: Number(e.target.value) }),
              )
            }
          />
        </>
      ) : null}

      {node.kind === 'cost' ? (
        <FormulaField
          value={node.formulaRef ?? ''}
          onSave={(expression) => {
            onModelChange(updateNodeFormula(model, node.id, expression || undefined))
          }}
        />
      ) : null}

      <div className="border-t border-[color:var(--line-default)] pt-3 text-sm">
        <p>
          <span className="font-medium">Zuordnung:</span> {result?.provenance.allocationRule ?? 'none'}
        </p>
        {result?.value.status === 'unresolved' ? (
          <p className="text-[color:var(--semantic-warning)]" role="status">
            Unvollständig: {result.value.message}
          </p>
        ) : result?.value.status === 'ok' ? (
          <p className="font-variant-numeric tabular-nums">
            {result.value.perUnit.toFixed(2)} / Stk · {result.value.periodTotal.toFixed(2)} Periode
          </p>
        ) : null}
      </div>

      {optional ? (
        <div className="flex flex-wrap gap-2 border-t border-[color:var(--line-default)] pt-3">
          <Button
            variant="ghost"
            onClick={() => {
              const next = duplicateNode(model, node.id)
              onModelChange(next)
              const added = next.nodes.find((n) => n.id !== node.id && n.key === `${node.key}_copy`)
              if (added) onSelectNode(added.id)
            }}
          >
            Duplizieren
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              const ok = window.confirm(`Kostenposition „${node.label}“ entfernen?`)
              if (!ok) return
              onModelChange(removeNode(model, node.id))
              onSelectNode(null)
            }}
          >
            Entfernen
          </Button>
        </div>
      ) : (
        <p className="text-xs text-[color:var(--ink-muted)]">
          Strukturknoten können nicht entfernt werden (Template bleibt unverändert).
        </p>
      )}
    </aside>
  )
}

function FormulaField({ value, onSave }: { value: string; onSave: (expression: string) => void }) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(value)
    setError(null)
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      <Field
        label="Formel (optional)"
        name="formula"
        value={draft}
        hint="Eingeschränkte Sprache, z. B. rate * hoursPerOrder"
        error={error ?? undefined}
        onChange={(e) => setDraft(e.target.value)}
      />
      <Button
        variant="ghost"
        onClick={() => {
          const trimmed = draft.trim()
          if (!trimmed) {
            setError(null)
            onSave('')
            return
          }
          try {
            parseFormula(trimmed, 'custom')
            setError(null)
            onSave(trimmed)
          } catch (err) {
            const message =
              err instanceof FormulaError
                ? 'Formel ungültig oder unsicher — Speichern blockiert.'
                : 'Formel konnte nicht geprüft werden.'
            setError(message)
          }
        }}
      >
        Formel speichern
      </Button>
    </div>
  )
}
