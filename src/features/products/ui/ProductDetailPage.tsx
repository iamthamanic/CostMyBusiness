/**
 * Product detail with editable cost-graph workbench.
 * Location: src/features/products/ui/ProductDetailPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRepos } from '@/app/providers/ReposProvider'
import type { DomainModel } from '@/core/model'
import { buildProductModel, CostGraphWorkbench } from '@/features/cost-graph'
import type { Product } from '@/features/products'
import {
  resolveTemplateId,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
} from '@/features/templates'
import { MarketingFunnelsPanel } from '@/features/funnels'
import { ContextPeriodChrome } from '@/features/scenarios'

export function ProductDetailPage() {
  const { productId } = useParams()
  const repos = useRepos()
  const [product, setProduct] = useState<Product | null>(null)
  const [model, setModel] = useState<DomainModel | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'template-error'>('loading')
  const [templateError, setTemplateError] = useState<string | null>(null)

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
        setModel(buildProductModel(found))
        setTemplateError(null)
        setState('ready')
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
  }, [productId])

  if (state === 'loading') return <p aria-busy="true">Lädt…</p>
  if (state === 'template-error' && product) {
    return (
      <section>
        <p role="alert" className="text-[color:var(--semantic-cost)]">
          {templateError}
        </p>
        <Link to="/products" className="text-[color:var(--accent-analysis)]">
          Zurück zu Produkten
        </Link>
      </section>
    )
  }
  if (state === 'missing' || !product || !model) {
    return (
      <section>
        <p role="alert">Produkt nicht gefunden.</p>
        <Link to="/products" className="text-[color:var(--accent-analysis)]">
          Zurück zu Produkten
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[color:var(--ink-muted)]">
            Produkt-Workbench · Vorlage {resolveTemplateId(product)}
          </p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>
        <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
          Zurück zur Produktliste
        </Link>
      </div>
      <ContextPeriodChrome productId={product.id} />
      <CostGraphWorkbench
        model={model}
        onModelChange={setModel}
        templateId={resolveTemplateId(product)}
      />
      <MarketingFunnelsPanel productId={product.id} />
    </section>
  )
}
