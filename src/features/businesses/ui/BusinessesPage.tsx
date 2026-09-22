/**
 * Businesses list + create form (German UI).
 * Location: src/features/businesses/ui/BusinessesPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import type { Business } from '@/features/businesses'
import { Button, Field } from '@/shared/ui'

type LoadState = 'loading' | 'ready' | 'error' | 'empty'

export function BusinessesPage() {
  const repos = useRepos()
  const workspaceId = useWorkspaceId()
  const [items, setItems] = useState<Business[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function reload() {
    setState('loading')
    setError(null)
    try {
      const list = await repos.businesses.list(workspaceId)
      setItems(list)
      setState(list.length === 0 ? 'empty' : 'ready')
    } catch {
      setError('Unternehmen konnten nicht geladen werden.')
      setState('error')
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  async function onCreate() {
    setFormError(null)
    if (!name.trim()) {
      setFormError('Bitte einen Namen angeben.')
      return
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      setFormError('Währung muss ein ISO-4217-Code sein (z. B. EUR).')
      return
    }
    setSaving(true)
    try {
      await repos.businesses.create({
        workspaceId,
        name: name.trim(),
        defaultCurrency: currency,
      })
      setName('')
      await reload()
    } catch {
      setFormError('Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(business: Business) {
    const ok = window.confirm(`Unternehmen „${business.name}“ wirklich löschen?`)
    if (!ok) return
    await repos.businesses.delete(business.id)
    await reload()
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Unternehmen</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Verwalten Sie Ihre Unternehmen. Produkte werden einem Unternehmen zugeordnet.
        </p>
      </header>

      <div className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
        <h2 className="mb-3 text-lg font-medium">Neues Unternehmen</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Name"
            name="businessName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Demo GmbH"
          />
          <Field
            label="Standardwährung"
            name="defaultCurrency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            hint="ISO 4217, z. B. EUR"
          />
        </div>
        {formError ? (
          <p className="mt-2 text-sm text-[color:var(--semantic-cost)]" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="mt-3">
          <Button onClick={() => void onCreate()} disabled={saving}>
            {saving ? 'Speichert…' : 'Unternehmen anlegen'}
          </Button>
        </div>
      </div>

      {state === 'loading' ? <p aria-busy="true">Lädt…</p> : null}
      {state === 'error' ? (
        <p role="alert" className="text-[color:var(--semantic-cost)]">
          {error}
        </p>
      ) : null}
      {state === 'empty' ? (
        <div className="rounded-[12px] border border-dashed border-[color:var(--line-default)] p-6 text-center">
          <p className="font-medium">Noch keine Unternehmen</p>
          <p className="text-sm text-[color:var(--ink-muted)]">Legen Sie Ihr erstes Unternehmen an.</p>
        </div>
      ) : null}
      {state === 'ready' ? (
        <ul className="divide-y divide-[color:var(--line-default)] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)]">
          {items.map((business) => (
            <li key={business.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{business.name}</p>
                <p className="text-xs text-[color:var(--ink-muted)]">
                  Währung {business.defaultCurrency}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/businesses/${business.id}/products`}
                  className="rounded-md border border-[color:var(--line-default)] px-3 py-2 text-sm"
                >
                  Produkte
                </Link>
                <Button variant="danger" onClick={() => void onDelete(business)}>
                  Löschen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
