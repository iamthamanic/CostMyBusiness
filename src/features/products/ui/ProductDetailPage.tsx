/**
 * Product detail placeholder until cost-graph workbench ships.
 * Location: src/features/products/ui/ProductDetailPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRepos } from '@/app/providers/ReposProvider'
import type { Product } from '@/features/products'

export function ProductDetailPage() {
  const { productId } = useParams()
  const repos = useRepos()
  const [product, setProduct] = useState<Product | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    void (async () => {
      if (!productId) {
        setState('missing')
        return
      }
      const found = await repos.products.get(productId)
      setProduct(found)
      setState(found ? 'ready' : 'missing')
    })()
  }, [productId])

  if (state === 'loading') return <p aria-busy="true">Lädt…</p>
  if (state === 'missing' || !product) {
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
    <section className="flex flex-col gap-4 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-6">
      <p className="text-sm text-[color:var(--ink-muted)]">Produkt-Workbench</p>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="text-[color:var(--ink-muted)]">
        Preis {product.price ?? 0} {product.currency} / Stück. Der Kostengraph folgt in der nächsten
        Ausbaustufe.
      </p>
      <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
        Zurück zur Produktliste
      </Link>
    </section>
  )
}
