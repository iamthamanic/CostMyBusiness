/**
 * Product detail — single visual product calculator workbench.
 * Location: src/features/products/ui/ProductDetailPage.tsx
 */
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import type { DomainModel } from '@/core/model'
import {
  applyProductPricingToModel,
  buildProductModel,
  ProductCalculatorWorkbench,
} from '@/features/cost-graph'
import type { Product } from '@/features/products'
import { CompactContextBar } from '@/features/scenarios'
import {
  DuplicateTemplateNameError,
  isCustomTemplateId,
  resolveTemplateId,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
} from '@/features/templates'
import { Button, Field } from '@/shared/ui'

export function ProductDetailPage() {
  const { productId } = useParams()
  const repos = useRepos()
  const workspaceId = useWorkspaceId()
  const [product, setProduct] = useState<Product | null>(null)
  const [model, setModel] = useState<DomainModel | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'template-error'>('loading')
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [resolvedValues, setResolvedValues] = useState<Record<string, number>>({})
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [showExpertGraph, setShowExpertGraph] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onResolvedValues = useCallback((values: Record<string, number>) => {
    setResolvedValues(values)
  }, [])

  useEffect(() => {
    void (async () => {
      if (!productId) {
        setState('missing')
        return
      }
      const found = await repos.products.get(productId)
      setProduct(found)
      if (!found) {
        setModel(null)
        setState('missing')
        return
      }
      try {
        const templateId = resolveTemplateId(found)
        let customDefinition = undefined
        if (isCustomTemplateId(templateId)) {
          const custom = await repos.customTemplates.get(templateId)
          if (!custom) {
            throw new UnknownTemplateError(
              templateId,
              `Eigene Vorlage „${templateId}“ wurde nicht gefunden.`,
            )
          }
          customDefinition = custom.definition
        }
        setModel(buildProductModel(found, undefined, customDefinition))
        setTemplateError(null)
        setState('ready')
        setSaveName(`${found.name} Vorlage`)
      } catch (err) {
        const messageDe =
          err instanceof UnknownTemplateError || err instanceof UnsupportedTemplateVersionError
            ? err.messageDe
            : 'Vorlage konnte nicht angewendet werden.'
        setTemplateError(messageDe)
        setModel(null)
        setState('template-error')
      }
    })()
  }, [productId, repos.products, repos.customTemplates])

  async function persistProduct(next: Product) {
    setProduct(next)
    if (model) {
      setModel(applyProductPricingToModel(model, next))
    }
    try {
      await repos.products.update(next.id, {
        sellingPrice: next.sellingPrice,
        priceKind: next.priceKind,
        taxRatePercent: next.taxRatePercent,
        pricingBasis: next.pricingBasis,
        currency: next.currency,
        name: next.name,
      })
    } catch {
      // Local UI stays authoritative; persist best-effort.
    }
  }

  async function onSaveAsTemplate() {
    if (!model || !product) return
    setSaveError(null)
    setSaveMsg(null)
    setSaving(true)
    try {
      const saved = await repos.customTemplates.saveFromModel({
        workspaceId,
        name: saveName,
        model,
      })
      setSaveMsg(`Vorlage „${saved.name}“ gespeichert.`)
    } catch (err) {
      if (err instanceof DuplicateTemplateNameError) {
        setSaveError(err.messageDe)
      } else {
        setSaveError('Vorlage konnte nicht gespeichert werden. Produktänderungen bleiben erhalten.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (state === 'loading') return <p aria-busy="true">Lädt…</p>
  if (state === 'template-error' && product) {
    return (
      <section>
        <p role="alert" className="text-[color:var(--semantic-cost)]">
          {templateError}
        </p>
        <Link to="/products" className="text-[color:var(--accent-analysis)]">
          ← Produkte
        </Link>
      </section>
    )
  }
  if (state === 'missing' || !product || !model) {
    return (
      <section>
        <p role="alert">Produkt nicht gefunden.</p>
        <Link to="/products" className="text-[color:var(--accent-analysis)]">
          ← Produkte
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5" data-testid="product-detail-workbench">
      <header className="flex flex-col gap-3 border-b border-[color:var(--line-default)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
            ← Produkte
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-[color:var(--ink-muted)]">
            {resolveTemplateId(product).includes('halteverbotszone')
              ? 'Traffic Safety · Halteverbotszone'
              : `Vorlage ${resolveTemplateId(product)}`}{' '}
            ·{' '}
            {product.pricingBasis === 'per_order'
              ? 'pro Auftrag'
              : product.pricingBasis === 'per_customer'
                ? 'pro Kunde'
                : product.pricingBasis === 'per_month'
                  ? 'pro Monat'
                  : 'pro Einheit'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <CompactContextBar productId={product.id} onResolvedValues={onResolvedValues} />
          <div className="relative">
            <Button variant="ghost" onClick={() => setOptionsOpen((o) => !o)}>
              Optionen
            </Button>
            {optionsOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-72 rounded-[12px] border border-[color:var(--line-default)] bg-white p-3 shadow-lg">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showExpertGraph}
                    onChange={(e) => setShowExpertGraph(e.target.checked)}
                  />
                  Experten-Graph anzeigen
                </label>
                <div className="mt-3 border-t border-[color:var(--line-default)] pt-3">
                  <Field
                    label="Als Vorlage speichern"
                    name="templateSaveName"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <Button
                    className="mt-2"
                    onClick={() => void onSaveAsTemplate()}
                    disabled={saving}
                  >
                    {saving ? 'Speichert…' : 'Speichern'}
                  </Button>
                  {saveMsg ? (
                    <p className="mt-2 text-xs text-[color:var(--ink-muted)]" role="status">
                      {saveMsg}
                    </p>
                  ) : null}
                  {saveError ? (
                    <p className="mt-2 text-xs text-[color:var(--semantic-cost)]" role="alert">
                      {saveError}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <ProductCalculatorWorkbench
        product={product}
        model={model}
        onModelChange={setModel}
        onProductChange={(next) => void persistProduct(next)}
        resolvedValues={resolvedValues}
        showExpertGraph={showExpertGraph}
      />
    </section>
  )
}
