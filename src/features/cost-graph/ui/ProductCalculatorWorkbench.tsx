/**
 * Primary visual product calculator — CSS grid departments + result spine.
 * Location: src/features/cost-graph/ui/ProductCalculatorWorkbench.tsx
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { evaluate } from '@/core/calculation'
import type { DomainModel } from '@/core/model'
import { useRepos } from '@/app/providers/ReposProvider'
import type { Product } from '@/features/products'
import type { MarketingCampaign, ProductFunnel } from '@/features/funnels'
import { createEmptyCampaign } from '@/features/funnels'
import { Button } from '@/shared/ui'
import { applyResolvedValuesToModel } from '../application/apply-resolved-values'
import { composeFunnelsIntoModel } from '../application/compose-funnels-into-model'
import { addCostNode, removeNode, updateNodeEnabled, updateNodeInputs } from '../application/mutate-model'
import { projectWorkbenchView } from '../application/project-workbench-view'
import { DepartmentColumn } from './DepartmentColumn'
import { ProductRootCard } from './ProductRootCard'
import { ResultSpine } from './ResultSpine'
import { CostGraphWorkbench } from './CostGraphWorkbench'
import { WorkbenchFanConnector, WorkbenchStemConnector } from './WorkbenchConnectors'

type Props = {
  product: Product
  model: DomainModel
  onModelChange: (next: DomainModel) => void
  onProductChange: (next: Product) => void
  resolvedValues?: Record<string, number>
  showExpertGraph?: boolean
  /** Szenario / Zeitraum / Experten — rendered above the product root card. */
  contextToolbar?: ReactNode
}

type CostView = 'contribution' | 'fullyLoaded'

export function ProductCalculatorWorkbench({
  product,
  model,
  onModelChange,
  onProductChange,
  resolvedValues = {},
  showExpertGraph = false,
  contextToolbar,
}: Props) {
  const repos = useRepos()
  const [funnels, setFunnels] = useState<ProductFunnel[]>([])
  const [funnelError, setFunnelError] = useState<string | null>(null)
  const [channelsPromoted, setChannelsPromoted] = useState(false)
  const promotingRef = useRef(false)
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(() => new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set())
  const [mobileOpen, setMobileOpen] = useState<Set<string>>(() => new Set(['operations']))
  const [costView, setCostView] = useState<CostView>('fullyLoaded')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    setChannelsPromoted(false)
    promotingRef.current = false
  }, [product.id])

  useEffect(() => {
    void (async () => {
      try {
        const listed = await repos.funnels.listByProduct(product.id)
        setFunnels(listed)
        setFunnelError(null)
      } catch {
        setFunnelError('Funnels konnten nicht geladen werden.')
        setFunnels([])
      }
    })()
  }, [product.id, repos.funnels])

  // Template marketing channels (Google Ads, SEO, …) → real funnels with ⋯ / campaigns
  useEffect(() => {
    if (channelsPromoted || promotingRef.current) return
    promotingRef.current = true
    void (async () => {
      try {
        const listed = await repos.funnels.listByProduct(product.id)
        const marketingGroup = model.nodes.find(
          (n) => n.kind === 'group' && (n.key === 'g_marketing' || n.key === 'marketing'),
        )
        if (!marketingGroup) {
          setFunnels(listed)
          setChannelsPromoted(true)
          return
        }

        const channelCosts = model.nodes.filter(
          (n) => n.parentId === marketingGroup.id && n.kind === 'cost',
        )
        let nextModel = model
        const nextFunnels = [...listed]
        let modelDirty = false

        for (const cost of channelCosts) {
          const existing = nextFunnels.find(
            (f) => f.type === 'marketing' && f.name === cost.label,
          )
          if (!existing) {
            const seedRate = typeof cost.inputs.rate === 'number' ? cost.inputs.rate : 0
            const campaign = {
              ...createEmptyCampaign('Standard'),
              costPerConversion: seedRate,
              conversionRate: seedRate > 0 ? 1 : 0,
            }
            const created = await repos.funnels.createMarketing({
              productId: product.id,
              name: cost.label,
              campaigns: [campaign],
            })
            nextFunnels.push(created)
          }
          if (cost.enabled !== false) {
            nextModel = updateNodeEnabled(nextModel, cost.id, false)
            modelDirty = true
          }
        }

        setFunnels(nextFunnels)
        if (modelDirty) onModelChange(nextModel)
        setChannelsPromoted(true)
      } catch {
        promotingRef.current = false
        setChannelsPromoted(true)
      }
    })()
  }, [channelsPromoted, product.id, model, repos.funnels, onModelChange])

  const composed = useMemo(() => {
    const withFunnels = composeFunnelsIntoModel(model, funnels)
    return applyResolvedValuesToModel(withFunnels, resolvedValues)
  }, [model, funnels, resolvedValues])

  const evaluation = useMemo(() => evaluate(composed), [composed])
  const view = useMemo(
    () => projectWorkbenchView(composed, evaluation),
    [composed, evaluation],
  )

  function onCostInput(nodeId: string, fieldId: string, value: number) {
    if (nodeId.startsWith('n_funnel_')) {
      const funnelId = nodeId.replace(/^n_funnel_/, '')
      const funnel = funnels.find((f) => f.id === funnelId)
      if (!funnel) return
      void (async () => {
        try {
          const patch =
            funnel.type === 'marketing'
              ? { marketingCosts: { [fieldId]: value } }
              : { salesCosts: { [fieldId]: value } }
          const updated = await repos.funnels.update(funnelId, patch)
          setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
          setFunnelError(null)
        } catch {
          setFunnelError('Funnel-Änderung konnte nicht gespeichert werden.')
        }
      })()
      return
    }
    onModelChange(updateNodeInputs(model, nodeId, { [fieldId]: value }))
  }

  function onPricingChange(patch: {
    name?: string
    sellingPrice?: number
    taxRatePercent?: number
    priceKind?: 'gross' | 'net'
    pricingBasis?: Product['pricingBasis']
    currency?: string
  }) {
    onProductChange({
      ...product,
      ...patch,
      price: patch.sellingPrice ?? product.sellingPrice,
      updatedAt: new Date().toISOString(),
    })
  }

  function onAddCostToDept(deptNodeId: string) {
    const next = addCostNode(model)
    const added = next.nodes[next.nodes.length - 1]
    if (added) {
      onModelChange({
        ...next,
        nodes: next.nodes.map((n) =>
          n.id === added.id ? { ...n, parentId: deptNodeId } : n,
        ),
      })
    } else {
      onModelChange(next)
    }
  }

  function onSetEnabled(nodeId: string, enabled: boolean) {
    if (nodeId.startsWith('n_funnel_')) {
      const funnelId = nodeId.replace(/^n_funnel_/, '')
      void (async () => {
        try {
          const updated = await repos.funnels.update(funnelId, { enabled })
          setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
          setFunnelError(null)
        } catch {
          setFunnelError('Funnel-Status konnte nicht gespeichert werden.')
        }
      })()
      return
    }
    onModelChange(updateNodeEnabled(model, nodeId, enabled))
  }

  function onRemoveCost(nodeId: string) {
    if (nodeId.startsWith('n_funnel_')) {
      const funnelId = nodeId.replace(/^n_funnel_/, '')
      const funnel = funnels.find((f) => f.id === funnelId)
      const ok = window.confirm(
        `„${funnel?.name ?? 'Funnel'}“ wirklich entfernen?`,
      )
      if (!ok) return
      void (async () => {
        try {
          await repos.funnels.delete(funnelId)
          setFunnels((prev) => prev.filter((f) => f.id !== funnelId))
          setFunnelError(null)
        } catch {
          setFunnelError('Funnel konnte nicht entfernt werden.')
        }
      })()
      return
    }
    const node = model.nodes.find((n) => n.id === nodeId)
    const ok = window.confirm(`„${node?.label ?? 'Position'}“ wirklich entfernen?`)
    if (!ok) return
    onModelChange(removeNode(model, nodeId))
  }

  function onAddFunnel(tone: 'marketing' | 'sales') {
    void (async () => {
      try {
        const created =
          tone === 'marketing'
            ? await repos.funnels.createMarketing({
                productId: product.id,
                name: 'Neuer Marketing-Funnel',
              })
            : await repos.funnels.createSales({
                productId: product.id,
                name: 'Neuer Sales-Funnel',
              })
        setFunnels((prev) => [...prev, created])
        setExpandedRows((prev) => new Set(prev).add(`n_funnel_${created.id}`))
        setFunnelError(null)
      } catch {
        setFunnelError('Funnel konnte nicht angelegt werden.')
      }
    })()
  }

  function onCampaignsChange(funnelId: string, campaigns: MarketingCampaign[]) {
    void (async () => {
      try {
        const updated = await repos.funnels.update(funnelId, { campaigns })
        setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
        setFunnelError(null)
      } catch {
        setFunnelError('Kampagnen konnten nicht gespeichert werden.')
      }
    })()
  }

  function onRenameFunnel(funnelId: string, name: string) {
    const nextName = name.trim() || 'Funnel'
    void (async () => {
      try {
        const updated = await repos.funnels.update(funnelId, { name: nextName })
        setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
        setFunnelError(null)
      } catch {
        setFunnelError('Funnel-Name konnte nicht gespeichert werden.')
      }
    })()
  }

  const hideAllocated = costView === 'contribution'
  const deptCount = Math.max(view.departments.length, 1)

  return (
    <div className="flex flex-col gap-2" data-testid="product-calculator-workbench">
      {funnelError ? (
        <p className="text-sm text-[color:var(--semantic-cost)]" role="alert">
          {funnelError}
        </p>
      ) : null}

      <div
        className="overflow-x-auto rounded-[var(--radius-panel)] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4 md:p-6"
        data-testid="workbench-canvas"
      >
        <div
          className="mx-auto origin-top transition-transform md:min-w-[1280px]"
          style={{
            transform: `scale(${zoom})`,
            width: zoom === 1 ? '100%' : `${100 / zoom}%`,
          }}
        >
          {contextToolbar ? (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
              {contextToolbar}
            </div>
          ) : null}

          <div className="flex justify-center">
            <ProductRootCard product={product} onPricingChange={onPricingChange} />
          </div>

          {/* Desktop: fan → departments → fan */}
          <div className="hidden md:block">
            <WorkbenchStemConnector />
            <WorkbenchFanConnector branches={deptCount} direction="down" />

            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${deptCount}, minmax(240px, 1fr))`,
              }}
              data-testid="department-grid"
            >
              {view.departments.map((dept) => (
                <DepartmentColumn
                  key={dept.nodeId}
                  department={dept}
                  collapsed={collapsedDepts.has(dept.nodeId)}
                  expandedRowIds={expandedRows}
                  hideAllocated={hideAllocated && dept.tone === 'overhead'}
                  onToggleCollapse={() => {
                    setCollapsedDepts((prev) => {
                      const next = new Set(prev)
                      if (next.has(dept.nodeId)) next.delete(dept.nodeId)
                      else next.add(dept.nodeId)
                      return next
                    })
                  }}
                  onToggleRow={(id) => {
                    setExpandedRows((prev) => {
                      const next = new Set(prev)
                      if (next.has(id)) next.delete(id)
                      else next.add(id)
                      return next
                    })
                  }}
                  onInputChange={onCostInput}
                  onSetEnabled={onSetEnabled}
                  onRemove={onRemoveCost}
                  onAddCost={() => onAddCostToDept(dept.nodeId)}
                  funnels={funnels}
                  onAddFunnel={
                    dept.tone === 'marketing' || dept.tone === 'sales'
                      ? () => onAddFunnel(dept.tone === 'marketing' ? 'marketing' : 'sales')
                      : undefined
                  }
                  onCampaignsChange={onCampaignsChange}
                  onRenameFunnel={onRenameFunnel}
                />
              ))}
            </div>

            <WorkbenchFanConnector branches={deptCount} direction="up" />
            <WorkbenchStemConnector />
          </div>

          {/* Mobile: department accordions */}
          <div className="mt-4 flex flex-col gap-3 md:hidden" data-testid="department-accordions">
            {view.departments.map((dept) => {
              const open = mobileOpen.has(dept.nodeId)
              return (
                <div key={dept.nodeId}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-[12px] border border-[color:var(--line-default)] bg-white px-3 py-3 text-left"
                    aria-expanded={open}
                    onClick={() => {
                      setMobileOpen((prev) => {
                        const next = new Set(prev)
                        if (next.has(dept.nodeId)) next.delete(dept.nodeId)
                        else next.add(dept.nodeId)
                        return next
                      })
                    }}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{dept.label}</span>
                      <span className="text-xs text-[color:var(--ink-muted)]">
                        {dept.totalPerUnit !== null ? `${dept.totalPerUnit.toFixed(2)} €` : '—'}
                      </span>
                    </span>
                    <span className="text-xs">{open ? '▼' : '▶'}</span>
                  </button>
                  {open ? (
                    <div className="mt-2">
                      <DepartmentColumn
                        department={dept}
                        collapsed={false}
                        expandedRowIds={expandedRows}
                        hideAllocated={hideAllocated && dept.tone === 'overhead'}
                        funnels={funnels}
                        onToggleCollapse={() => undefined}
                        onToggleRow={(id) => {
                          setExpandedRows((prev) => {
                            const next = new Set(prev)
                            if (next.has(id)) next.delete(id)
                            else next.add(id)
                            return next
                          })
                        }}
                        onInputChange={onCostInput}
                        onSetEnabled={onSetEnabled}
                        onRemove={onRemoveCost}
                        onAddCost={() => onAddCostToDept(dept.nodeId)}
                        onAddFunnel={
                          dept.tone === 'marketing' || dept.tone === 'sales'
                            ? () => onAddFunnel(dept.tone === 'marketing' ? 'marketing' : 'sales')
                            : undefined
                        }
                        onCampaignsChange={onCampaignsChange}
                        onRenameFunnel={onRenameFunnel}
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <ResultSpine spine={view.spine} costView={costView} />
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] px-3 py-2">
        <div className="flex items-center gap-1" role="group" aria-label="Ansicht">
          <span className="mr-1 text-[12px] font-medium text-[color:var(--ink-muted)]">
            Ansicht
          </span>
          <Button
            variant={costView === 'contribution' ? 'primary' : 'ghost'}
            className="h-8 px-2.5 text-xs"
            onClick={() => setCostView('contribution')}
          >
            Contribution
          </Button>
          <Button
            variant={costView === 'fullyLoaded' ? 'primary' : 'ghost'}
            className="h-8 px-2.5 text-xs"
            onClick={() => setCostView('fullyLoaded')}
          >
            Fully Loaded
          </Button>
        </div>
        <div className="hidden items-center gap-1 md:flex" role="group" aria-label="Zoom">
          <Button
            variant="ghost"
            className="h-8 w-8 px-0"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
            aria-label="Verkleinern"
          >
            −
          </Button>
          <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-[color:var(--ink-muted)]">
            {Math.round(zoom * 100)} %
          </span>
          <Button
            variant="ghost"
            className="h-8 w-8 px-0"
            onClick={() => setZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(1))))}
            aria-label="Vergrößern"
          >
            +
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2.5 text-xs"
            onClick={() => setZoom(1)}
            aria-label="100 Prozent"
          >
            Fit
          </Button>
        </div>
      </footer>

      {showExpertGraph ? (
        <details className="rounded-[12px] border border-[color:var(--line-default)] bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium text-[color:var(--ink-muted)]">
            Experten-Graph (React Flow)
          </summary>
          <div className="mt-3">
            <CostGraphWorkbench
              model={model}
              onModelChange={onModelChange}
              productId={product.id}
              templateId={product.templateId}
            />
          </div>
        </details>
      ) : null}
    </div>
  )
}
