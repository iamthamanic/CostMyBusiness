/**
 * Product create template picker with shipped + custom templates.
 * Location: src/features/templates/ui/TemplatePicker.tsx
 */
import { useEffect, useState } from 'react'
import {
  defaultIncludedOptionalKeys,
  getShippedTemplate,
  listShippedTemplates,
  listSuggestedOptionalNodes,
} from '../application/load-templates'
import { isCustomTemplateId } from '../application/apply-template'
import type { CustomTemplate } from '../domain/custom-template'
import type { ShippedTemplate } from '../domain/template-schema'

export type TemplatePickerValue = {
  templateId: string
  includedOptionalKeys: string[]
}

type Props = {
  value: TemplatePickerValue
  onChange: (next: TemplatePickerValue) => void
  customTemplates?: CustomTemplate[]
}

export function TemplatePicker({ value, onChange, customTemplates = [] }: Props) {
  const shipped = listShippedTemplates()

  function resolveDefinition(id: string): ShippedTemplate {
    if (isCustomTemplateId(id)) {
      const found = customTemplates.find((t) => t.id === id)
      if (!found) throw new Error(`Custom template missing: ${id}`)
      return found.definition
    }
    return getShippedTemplate(id || 'custom')
  }

  const [selected, setSelected] = useState<ShippedTemplate>(() => {
    try {
      return resolveDefinition(value.templateId || 'custom')
    } catch {
      return getShippedTemplate('custom')
    }
  })

  useEffect(() => {
    try {
      setSelected(resolveDefinition(value.templateId || 'custom'))
    } catch {
      setSelected(getShippedTemplate('custom'))
    }
  }, [value.templateId, customTemplates])

  const optionals = listSuggestedOptionalNodes(selected)

  function selectShipped(id: string) {
    const template = getShippedTemplate(id)
    setSelected(template)
    onChange({
      templateId: id,
      includedOptionalKeys: defaultIncludedOptionalKeys(template),
    })
  }

  function selectCustom(t: CustomTemplate) {
    setSelected(t.definition)
    onChange({
      templateId: t.id,
      includedOptionalKeys: defaultIncludedOptionalKeys(t.definition),
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
      <legend className="text-sm font-medium">Vorlage</legend>
      <p className="text-xs text-[color:var(--ink-muted)]">
        Branchen- oder eigene Vorlage. Optionale Positionen können Sie abwählen.
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
        Ausgeliefert
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {shipped.map((t) => {
          const active = t.id === value.templateId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectShipped(t.id)}
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

      {customTemplates.length > 0 ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
            Eigene Vorlagen
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {customTemplates.map((t) => {
              const active = t.id === value.templateId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectCustom(t)}
                  aria-pressed={active}
                  className={`rounded-[12px] border px-3 py-3 text-left transition-colors ${
                    active
                      ? 'border-[color:var(--accent-analysis)] bg-[color:var(--surface-panel)] ring-2 ring-[color:var(--accent-analysis)]'
                      : 'border-[color:var(--line-default)] bg-white hover:border-[color:var(--accent-analysis)]'
                  }`}
                >
                  <span className="block font-medium">{t.name}</span>
                  <span className="mt-1 block text-xs text-[color:var(--ink-muted)]">
                    Eigene Vorlage · v{t.version}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : null}

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
