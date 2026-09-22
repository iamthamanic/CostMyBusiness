/**
 * Product create template picker with optional ops deselection (Traffic Safety etc.).
 * Location: src/features/templates/ui/TemplatePicker.tsx
 */
import { useEffect, useState } from 'react'
import {
  defaultIncludedOptionalKeys,
  getShippedTemplate,
  listShippedTemplates,
  listSuggestedOptionalNodes,
} from '../application/load-templates'
import type { ShippedTemplate } from '../domain/template-schema'

export type TemplatePickerValue = {
  templateId: string
  includedOptionalKeys: string[]
}

type Props = {
  value: TemplatePickerValue
  onChange: (next: TemplatePickerValue) => void
}

export function TemplatePicker({ value, onChange }: Props) {
  const templates = listShippedTemplates()
  const [selected, setSelected] = useState<ShippedTemplate>(() =>
    getShippedTemplate(value.templateId || 'custom'),
  )

  useEffect(() => {
    const next = getShippedTemplate(value.templateId || 'custom')
    setSelected(next)
  }, [value.templateId])

  const optionals = listSuggestedOptionalNodes(selected)

  function selectTemplate(id: string) {
    const template = getShippedTemplate(id)
    setSelected(template)
    onChange({
      templateId: id,
      includedOptionalKeys: defaultIncludedOptionalKeys(template),
    })
  }

  function toggleOptional(key: string, checked: boolean) {
    const set = new Set(value.includedOptionalKeys)
    if (checked) set.add(key)
    else set.delete(key)
    onChange({
      templateId: value.templateId,
      includedOptionalKeys: [...set],
    })
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Branchenvorlage</legend>
      <p className="text-xs text-[color:var(--ink-muted)]">
        Die Vorlage erzeugt den Kostengraphen. Optionale Positionen können Sie abwählen.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const active = t.id === value.templateId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t.id)}
              aria-pressed={active}
              className={`rounded-[12px] border px-3 py-3 text-left transition-colors ${
                active
                  ? 'border-[color:var(--accent-analysis)] bg-[color:var(--surface-panel)] ring-2 ring-[color:var(--accent-analysis)]'
                  : 'border-[color:var(--line-default)] bg-white hover:border-[color:var(--accent-analysis)]'
              }`}
            >
              <span className="block font-medium">{t.labelDe}</span>
              <span className="mt-1 block text-xs text-[color:var(--ink-muted)]">{t.descriptionDe}</span>
            </button>
          )
        })}
      </div>

      {optionals.length > 0 ? (
        <div className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-3">
          <p className="mb-2 text-sm font-medium">
            Vorgeschlagene Kostenpositionen
            {selected.id === 'traffic-safety' ? ' (Betrieb / Verkehrssicherung)' : ''}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {optionals.map((node) => (
              <li key={node.key}>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={value.includedOptionalKeys.includes(node.key)}
                    onChange={(e) => toggleOptional(node.key, e.target.checked)}
                  />
                  <span>
                    <span className="font-medium">{node.labelDe}</span>
                    {node.layerKey ? (
                      <span className="block text-xs text-[color:var(--ink-muted)]">
                        Schicht: {node.layerKey}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </fieldset>
  )
}
