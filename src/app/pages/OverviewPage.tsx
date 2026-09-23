/**
 * Primary calculator home — product tabs + Margin Spine workbench.
 * Location: src/app/pages/OverviewPage.tsx
 */
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import type { DomainModel } from '@/core/model'
import type { Business } from '@/features/businesses'
import {
  applyProductPricingToModel,
  buildProductModel,
  ProductCalculatorWorkbench,
} from '@/features/cost-graph'
import type { Product } from '@/features/products'
import {
  defaultIncludedOptionalKeys,
  getShippedTemplate,
  isCustomTemplateId,
  resolveTemplateId,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
} from '@/features/templates'
import { CompactContextBar } from '@/features/scenarios'
import { WorkbenchGhost } from './WorkbenchGhost'

const LAST_PRODUCT_KEY = 'cmb:lastProductId'
const DEFAULT_TEMPLATE = 'traffic-safety-halteverbotszone'
const DEFAULT_PRICE = 89

export function OverviewPage() {
  const repos = useRepos()
  const workspaceId = useWorkspaceId()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramProductId = searchParams.get('p')

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [model, setModel] = useState<DomainModel | null>(null)
  const [loadState, setLoadState] = useState<'boot' | 'ready' | 'missing' | 'template-error'>(
    'boot',
  )
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [resolvedValues, setResolvedValues] = useState<Record<string, number>>({})
  const [showExpertGraph, setShowExpertGraph] = useState(false)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const onResolvedValues = useCallback((values: Record<string, number>) => {
    setResolvedValues(values)
  }, [])

  async function refreshLists() {
    const biz = await repos.businesses.list(workspaceId)
    setBusinesses(biz)
    const all: Product[] = []
    for (const b of biz) {
      all.push(...(await repos.products.listByBusiness(b.id)))
    }
    setProducts(all)
    return { biz, all }
  }

  useEffect(() => {
    void (async () => {
      const { all } = await refreshLists()
      const stored =
        typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_PRODUCT_KEY) : null
      const target =
        paramProductId ||
        (stored && all.some((p) => p.id === stored) ? stored : null) ||
        all[0]?.id ||
        null
      if (target && target !== paramProductId) {
        setSearchParams({ p: target }, { replace: true })
        return
      }
      if (!target) {
        setProduct(null)
        setModel(null)
        setLoadState('ready')
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once; p handled below
  }, [])

  useEffect(() => {
    void (async () => {
      if (!paramProductId) {
        if (products.length === 0 && loadState !== 'boot') {
          setProduct(null)
          setModel(null)
          setLoadState('ready')
        }
        return
      }
      setLoadState('boot')
      const found = await repos.products.get(paramProductId)
      if (!found) {
        setProduct(null)
        setModel(null)
        setLoadState('missing')
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
        setProduct(found)
        setModel(buildProductModel(found, undefined, customDefinition))
        setTemplateError(null)
        setLoadState('ready')
        localStorage.setItem(LAST_PRODUCT_KEY, found.id)
      } catch (err) {
        setTemplateError(
          err instanceof UnknownTemplateError || err instanceof UnsupportedTemplateVersionError
            ? err.messageDe
            : 'Vorlage konnte nicht angewendet werden.',
        )
        setProduct(found)
        setModel(null)
        setLoadState('template-error')
      }
    })()
  }, [paramProductId, repos.products, repos.customTemplates])

  async function persistProduct(next: Product) {
    setProduct(next)
    setProducts((prev) =>
      prev.map((p) => (p.id === next.id ? { ...p, name: next.name, currency: next.currency } : p)),
    )
    if (model) setModel(applyProductPricingToModel(model, next))
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
      // best-effort
    }
  }

  async function onCreateTab() {
    setActionError(null)
    setCreating(true)
    try {
      let businessId = businesses[0]?.id
      if (!businessId) {
        const biz = await repos.businesses.create({
          workspaceId,
          name: 'Mein Unternehmen',
          defaultCurrency: 'EUR',
        })
        businessId = biz.id
      }
      const template = getShippedTemplate(DEFAULT_TEMPLATE)
      const created = await repos.products.create({
        businessId,
        name: 'Neues Produkt',
        currency: 'EUR',
        sellingPrice: DEFAULT_PRICE,
        priceKind: 'gross',
        taxRatePercent: 19,
        pricingBasis: 'per_order',
        templateId: template.id,
        templateVersion: template.version,
        includedOptionalKeys: defaultIncludedOptionalKeys(template),
      })
      await refreshLists()
      setSearchParams({ p: created.id })
    } catch {
      setActionError('Produkt konnte nicht angelegt werden.')
    } finally {
      setCreating(false)
    }
  }

  async function onCloseTab(id: string, name: string) {
    const ok = window.confirm(`Produkt „${name}“ wirklich löschen?`)
    if (!ok) return
    setActionError(null)
    try {
      await repos.products.delete(id)
      const { all } = await refreshLists()
      if (paramProductId === id) {
        const next = all[0]?.id
        if (next) setSearchParams({ p: next })
        else {
          setSearchParams({})
          setProduct(null)
          setModel(null)
          setLoadState('ready')
          localStorage.removeItem(LAST_PRODUCT_KEY)
        }
      }
    } catch {
      setActionError('Löschen fehlgeschlagen.')
    }
  }

  function onSelectTab(id: string) {
    if (id !== paramProductId) setSearchParams({ p: id })
  }

  return (
    <section className="flex flex-col gap-3" data-testid="calculator-home">
      <div
        className="rounded-[var(--radius-panel)] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] shadow-[0_1px_0_rgba(23,32,51,0.04)]"
        data-testid="product-tabs"
      >
        <div
          className="flex items-stretch overflow-x-auto"
          role="tablist"
          aria-label="Produkte"
        >
          {products.map((p) => {
            const active = p.id === paramProductId
            return (
              <div
                key={p.id}
                role="presentation"
                className={`group flex min-w-0 max-w-[14rem] shrink-0 items-center border-r border-[color:var(--line-default)] ${
                  active
                    ? 'product-tab-active'
                    : 'bg-[color:var(--surface-rail)] hover:bg-[color:var(--surface-panel)]'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  id={`product-tab-${p.id}`}
                  className={`min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm ${
                    active
                      ? 'font-semibold text-[color:var(--accent-analysis)]'
                      : 'font-medium text-[color:var(--ink-muted)]'
                  }`}
                  onClick={() => onSelectTab(p.id)}
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[color:var(--ink-muted)] opacity-70 hover:bg-[color:var(--semantic-cost)]/10 hover:text-[color:var(--semantic-cost)] hover:opacity-100"
                  aria-label={`${p.name} schließen und löschen`}
                  onClick={(e) => {
                    e.stopPropagation()
                    void onCloseTab(p.id, p.name)
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center text-lg font-medium text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-rail)] hover:text-[color:var(--ink-primary)] disabled:opacity-50"
            aria-label="Neues Produkt"
            data-testid="product-tab-add"
            disabled={creating}
            onClick={() => void onCreateTab()}
          >
            {creating ? '…' : '+'}
          </button>
        </div>
        {actionError ? (
          <p
            className="border-t border-[color:var(--line-default)] px-3 py-2 text-sm text-[color:var(--semantic-cost)]"
            role="alert"
          >
            {actionError}
          </p>
        ) : null}
      </div>

      {loadState === 'boot' ? (
        <p className="text-sm text-[color:var(--ink-muted)]" aria-busy="true">
          Lädt…
        </p>
      ) : null}
      {loadState === 'template-error' ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          {templateError}
        </p>
      ) : null}
      {loadState === 'missing' ? (
        <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
          Produkt nicht gefunden. Lege mit + ein neues an.
        </p>
      ) : null}

      {product && model && loadState === 'ready' ? (
        <ProductCalculatorWorkbench
          product={product}
          model={model}
          onModelChange={setModel}
          onProductChange={(next) => void persistProduct(next)}
          resolvedValues={resolvedValues}
          showExpertGraph={showExpertGraph}
          contextToolbar={
            <>
              <CompactContextBar productId={product.id} onResolvedValues={onResolvedValues} />
              <label className="flex items-center gap-2 text-[12px] text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  className="rounded border-[color:var(--line-default)]"
                  checked={showExpertGraph}
                  onChange={(e) => setShowExpertGraph(e.target.checked)}
                />
                Experten-Graph
              </label>
            </>
          }
        />
      ) : loadState === 'ready' && !product ? (
        <WorkbenchGhost />
      ) : null}
    </section>
  )
}
