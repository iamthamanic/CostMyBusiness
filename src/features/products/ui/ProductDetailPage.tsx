/**
 * Product detail with editable cost-graph workbench and save-as-template.
 * Location: src/features/products/ui/ProductDetailPage.tsx
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRepos, useWorkspaceId } from '@/app/providers/ReposProvider'
import { resolveNetRevenue } from '@/core/pricing'
import type { DomainModel } from '@/core/model'
import { buildProductModel, CostGraphWorkbench } from '@/features/cost-graph'
import type { Product } from '@/features/products'
import {
  BreakEvenPanel,
  FunnelFilterPanel,
  MarketingFunnelsPanel,
  SalesFunnelsPanel,
} from '@/features/funnels'
import { ContextPeriodChrome } from '@/features/scenarios'
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
  const [saveName, setSaveName] = useState('')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
  }, [productId])

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
          {(() => {
            const pricing = resolveNetRevenue({
              sellingPrice: product.sellingPrice,
              priceKind: product.priceKind,
              taxRatePercent: product.taxRatePercent,
              pricingBasis: product.pricingBasis,
              currency: product.currency,
            })
            if (pricing.status !== 'ok') {
              return (
                <p role="status" className="mt-1 text-sm text-[color:var(--semantic-warning)]">
                  {pricing.messageDe}
                </p>
              )
            }
            return (
              <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
                {pricing.grossRevenue.toFixed(2)} {product.currency}{' '}
                {product.priceKind === 'gross' ? 'brutto' : 'brutto-äquiv.'} · USt{' '}
                {product.taxRatePercent}% (keine Kostenposition) → Nettoerlös{' '}
                <span className="font-medium tabular-nums text-[color:var(--ink-primary)]">
                  {pricing.netRevenue.toFixed(2)} {product.currency}
                </span>
              </p>
            )
          })()}
        </div>
        <Link to="/products" className="text-sm text-[color:var(--accent-analysis)]">
          Zurück zur Produktliste
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-3">
        <Field
          label="Als Vorlage speichern"
          name="templateSaveName"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          hint="Kopiert das aktuelle Modell — ausgelieferte Vorlagen bleiben unverändert"
        />
        <Button onClick={() => void onSaveAsTemplate()} disabled={saving}>
          {saving ? 'Speichert…' : 'Als Vorlage speichern'}
        </Button>
        {saveMsg ? (
          <p className="w-full text-sm text-[color:var(--ink-muted)]" role="status">
            {saveMsg}{' '}
            <Link to="/templates" className="text-[color:var(--accent-analysis)]">
              Zu Vorlagen
            </Link>
          </p>
        ) : null}
        {saveError ? (
          <p className="w-full text-sm text-[color:var(--semantic-cost)]" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>

      <ContextPeriodChrome productId={product.id} />
      <CostGraphWorkbench
        model={model}
        onModelChange={setModel}
        productId={product.id}
        templateId={
          isCustomTemplateId(resolveTemplateId(product))
            ? 'custom'
            : resolveTemplateId(product)
        }
      />
      <FunnelFilterPanel productId={product.id} model={model} />
      <BreakEvenPanel />
      <MarketingFunnelsPanel productId={product.id} />
      <SalesFunnelsPanel productId={product.id} />
    </section>
  )
}
