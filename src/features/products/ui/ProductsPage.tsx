/**
 * Products list/create scoped to a business, plus global products index.
 * Location: src/features/products/ui/ProductsPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import type { Business } from '@/features/businesses'
import type { Product } from '@/features/products'
import {
  TemplatePicker,
  type TemplatePickerValue,
  getShippedTemplate,
  defaultIncludedOptionalKeys,
} from '@/features/templates'
import { Button, Field } from '@/shared/ui'

type LoadState = 'loading' | 'ready' | 'error' | 'empty'

export function ProductsPage() {
  const { businessId } = useParams()
  const repos = useRepos()
  const workspaceId = useWorkspaceId()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(businessId ?? '')
  const [products, setProducts] = useState<Product[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [price, setPrice] = useState('0')
  const [templatePick, setTemplatePick] = useState<TemplatePickerValue>(() => {
    const custom = getShippedTemplate('custom')
    return {
      templateId: 'custom',
      includedOptionalKeys: defaultIncludedOptionalKeys(custom),
    }
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const list = await repos.businesses.list(workspaceId)
      setBusinesses(list)
      if (!selectedBusinessId && list[0]) {
        setSelectedBusinessId(list[0].id)
        setCurrency(list[0].defaultCurrency)
      }
    })()
  }, [])

  useEffect(() => {
    if (businessId) setSelectedBusinessId(businessId)
  }, [businessId])

  useEffect(() => {
    void reloadProducts()
  }, [selectedBusinessId])

  async function reloadProducts() {
    if (!selectedBusinessId) {
      setProducts([])
      setState('empty')
      return
    }
    setState('loading')
    try {
      const list = await repos.products.listByBusiness(selectedBusinessId)
      setProducts(list)
      setState(list.length === 0 ? 'empty' : 'ready')
    } catch {
      setState('error')
    }
  }

  async function onCreate() {
    setFormError(null)
    if (!selectedBusinessId) {
      setFormError('Bitte zuerst ein Unternehmen wählen.')
      return
    }
    if (!name.trim()) {
      setFormError('Bitte einen Produktnamen angeben.')
      return
    }
    const priceNumber = Number(price)
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setFormError('Preis muss eine nicht-negative Zahl sein.')
      return
    }
    let templateVersion: number
    try {
      templateVersion = getShippedTemplate(templatePick.templateId).version
    } catch {
      setFormError('Unbekannte oder nicht unterstützte Vorlage.')
      return
    }
    setSaving(true)
    try {
      await repos.products.create({
        businessId: selectedBusinessId,
        name: name.trim(),
        currency,
        price: priceNumber,
        templateId: templatePick.templateId,
        templateVersion,
        includedOptionalKeys: templatePick.includedOptionalKeys,
      })
      setName('')
      await reloadProducts()
    } catch {
      setFormError('Produkt konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(product: Product) {
    const ok = window.confirm(`Produkt „${product.name}“ wirklich löschen?`)
    if (!ok) return
    await repos.products.delete(product.id)
    await reloadProducts()
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Produkte</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Produkte gehören zu einem Unternehmen und öffnen die Workbench mit Branchenvorlage.
        </p>
      </header>

      {businesses.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[color:var(--line-default)] p-6">
          <p className="font-medium">Noch kein Unternehmen vorhanden</p>
          <Link to="/businesses" className="mt-2 inline-block text-sm text-[color:var(--accent-analysis)]">
            Unternehmen anlegen
          </Link>
        </div>
      ) : (
        <>
          <label className="flex max-w-md flex-col gap-1 text-sm">
            <span className="font-medium">Unternehmen</span>
            <select
              className="rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2"
              value={selectedBusinessId}
              onChange={(e) => {
                const id = e.target.value
                setSelectedBusinessId(id)
                const biz = businesses.find((b) => b.id === id)
                if (biz) setCurrency(biz.defaultCurrency)
              }}
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
            <h2 className="mb-3 text-lg font-medium">Neues Produkt</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Field
                label="Name"
                name="productName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Absperrung Standard"
              />
              <Field
                label="Währung"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                hint="ISO 4217"
              />
              <Field
                label="Preis"
                name="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                hint={`Einheit: ${currency} / Stück`}
              />
            </div>
            <div className="mt-4">
              <TemplatePicker value={templatePick} onChange={setTemplatePick} />
            </div>
            {formError ? (
              <p className="mt-2 text-sm text-[color:var(--semantic-cost)]" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="mt-3">
              <Button onClick={() => void onCreate()} disabled={saving}>
                {saving ? 'Speichert…' : 'Produkt anlegen'}
              </Button>
            </div>
          </div>

          {state === 'loading' ? <p aria-busy="true">Lädt…</p> : null}
          {state === 'error' ? (
            <p role="alert" className="text-[color:var(--semantic-cost)]">
              Produkte konnten nicht geladen werden.
            </p>
          ) : null}
          {state === 'empty' ? (
            <div className="rounded-[12px] border border-dashed border-[color:var(--line-default)] p-6 text-center">
              <p className="font-medium">Noch keine Produkte</p>
              <p className="text-sm text-[color:var(--ink-muted)]">
                Legen Sie Ihr erstes Produkt aus einer Branchenvorlage an.
              </p>
            </div>
          ) : null}
          {state === 'ready' ? (
            <ul className="divide-y divide-[color:var(--line-default)] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)]">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {product.price ?? 0} {product.currency} / Stück
                      {product.templateId ? ` · Vorlage ${product.templateId}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="rounded-md bg-[color:var(--accent-analysis)] px-3 py-2 text-sm text-white"
                    >
                      Öffnen
                    </Link>
                    <Button variant="danger" onClick={() => void onDelete(product)}>
                      Löschen
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  )
}
