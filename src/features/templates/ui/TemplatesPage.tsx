/**
 * Browse shipped vs owner custom templates.
 * Location: src/features/templates/ui/TemplatesPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import { Button } from '@/shared/ui'
import { listShippedTemplates } from '../application/load-templates'
import type { CustomTemplate } from '../domain/custom-template'
import { LayerGuidancePanel } from './LayerGuidancePanel'

export function TemplatesPage() {
  const repos = useRepos()
  const workspaceId = useWorkspaceId()
  const shipped = listShippedTemplates()
  const [custom, setCustom] = useState<CustomTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    try {
      setCustom(await repos.customTemplates.list(workspaceId))
      setError(null)
    } catch {
      setError('Eigene Vorlagen konnten nicht geladen werden.')
    }
  }

  useEffect(() => {
    void reload()
  }, [workspaceId])

  return (
    <section className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Vorlagen</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Ausgelieferte Branchenvorlagen und Ihre eigenen Vorlagen.
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Ausgeliefert</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {shipped.map((t) => {
            const ops = t.layers.find((l) => l.key === 'operations')
            return (
              <li
                key={t.id}
                className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4"
              >
                <div>
                  <h3 className="text-base font-medium">{t.labelDe}</h3>
                  <p className="text-sm text-[color:var(--ink-muted)]">{t.descriptionDe}</p>
                  <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    Version {t.version} · {t.nodes.filter((n) => n.kind === 'cost').length}{' '}
                    Kostenpositionen
                  </p>
                </div>
                {ops ? <LayerGuidancePanel guidance={ops.guidance} layerLabel={ops.labelDe} /> : null}
                <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
                  Produkt mit dieser Vorlage anlegen
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Eigene Vorlagen</h2>
        {custom.length === 0 ? (
          <p className="text-sm text-[color:var(--ink-muted)]">
            Noch keine eigenen Vorlagen. Öffnen Sie ein Produkt und wählen Sie „Als Vorlage speichern“.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {custom.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4"
              >
                <div>
                  <h3 className="text-base font-medium">{t.name}</h3>
                  <p className="text-sm text-[color:var(--ink-muted)]">{t.definition.descriptionDe}</p>
                  <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    Version {t.version} · {t.definition.nodes.filter((n) => n.kind === 'cost').length}{' '}
                    Kostenpositionen
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
                    Produkt anlegen
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => {
                      void (async () => {
                        const ok = window.confirm(`Vorlage „${t.name}“ wirklich löschen?`)
                        if (!ok) return
                        await repos.customTemplates.delete(t.id)
                        await reload()
                      })()
                    }}
                  >
                    Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
