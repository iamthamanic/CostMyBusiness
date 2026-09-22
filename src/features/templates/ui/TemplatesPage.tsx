/**
 * Browse shipped industry templates (custom save comes in a later issue).
 * Location: src/features/templates/ui/TemplatesPage.tsx
 */
import { Link } from 'react-router-dom'
import { listShippedTemplates } from '../application/load-templates'
import { LayerGuidancePanel } from './LayerGuidancePanel'

export function TemplatesPage() {
  const templates = listShippedTemplates()

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Vorlagen</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Ausgelieferte Branchenvorlagen. Eigene Vorlagen speichern folgt später.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {templates.map((t) => {
          const ops = t.layers.find((l) => l.key === 'operations')
          return (
            <li
              key={t.id}
              className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4"
            >
              <div>
                <h2 className="text-lg font-medium">{t.labelDe}</h2>
                <p className="text-sm text-[color:var(--ink-muted)]">{t.descriptionDe}</p>
                <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                  Version {t.version} · {t.nodes.filter((n) => n.kind === 'cost').length} Kostenpositionen
                </p>
              </div>
              {ops ? (
                <LayerGuidancePanel guidance={ops.guidance} layerLabel={ops.labelDe} />
              ) : null}
              <Link
                to="/products"
                className="text-sm text-[color:var(--accent-analysis)]"
              >
                Produkt mit dieser Vorlage anlegen
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
