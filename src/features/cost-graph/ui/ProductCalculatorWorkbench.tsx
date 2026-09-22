/**
 * Primary visual product calculator — CSS grid departments + result spine.
 * Location: src/features/cost-graph/ui/ProductCalculatorWorkbench.tsx
 */
import { useEffect, useMemo, useState } from 'react'
import { evaluate } from '@/core/calculation'
import type { DomainModel } from '@/core/model'
import { useRepos } from '@/app/providers/ReposProvider'
import type { Product } from '@/features/products'
import type { ProductFunnel } from '@/features/funnels'
import { applyResolvedValuesToModel } from '../application/apply-resolved-values'
import { composeFunnelsIntoModel } from '../application/compose-funnels-into-model'
import { addCostNode, updateNodeInputs } from '../application/mutate-model'
import { projectWorkbenchView } from '../application/project-workbench-view'
import { DepartmentColumn } from './DepartmentColumn'
import { ProductRootCard } from './ProductRootCard'
import { ResultSpine } from './ResultSpine'
import { CostGraphWorkbench } from './CostGraphWorkbench'

type Props = {
  product: Product
  model: DomainModel
  onModelChange: (next: DomainModel) => void
  onProductChange: (next: Product) => void
  resolvedValues?: Record<string, number>
  showExpertGraph?: boolean
}

export function ProductCalculatorWorkbench({
  product,
  model,
  onModelChange,
  onProductChange,
  resolvedValues = {},
  showExpertGraph = false,
}: Props) {
  const repos = useRepos()
  const [funnels, setFunnels] = useState<ProductFunnel[]>([])
  const [funnelError, setFunnelError] = useState<string | null>(null)
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(() => new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set())
  const [mobileOpen, setMobileOpen] = useState<Set<string>>(() => new Set(['operations']))

  useEffect(() => {
    void (async () => {
      try {
        setFunnels(await repos.funnels.listByProduct(product.id))
        setFunnelError(null)
      } catch {
        setFunnelError('Funnels konnten nicht geladen werden.')
        setFunnels([])
      }
    })()
  }, [product.id, repos.funnels])

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

  return (
    <div className="flex flex-col gap-6" data-testid="product-calculator-workbench">
      <ProductRootCard
        product={product}
        onPricingChange={(patch) => {
          const nextProduct: Product = {
            ...product,
            ...patch,
            price: patch.sellingPrice ?? product.sellingPrice,
            updatedAt: new Date().toISOString(),
          }
          onProductChange(nextProduct)
        }}
      />

      {funnelError ? (
        <p className="text-sm text-[color:var(--semantic-cost)]" role="alert">
          {funnelError}
        </p>
      ) : null}

      {/* Desktop department grid */}
      <div
        className="hidden gap-3 overflow-x-auto pb-2 md:grid md:min-w-[1280px] md:grid-cols-5"
        data-testid="department-grid"
      >
        {view.departments.map((dept) => (
          <DepartmentColumn
            key={dept.nodeId}
            department={dept}
            collapsed={collapsedDepts.has(dept.nodeId)}
            expandedRowIds={expandedRows}
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
            onAddCost={() => {
              const next = addCostNode(model)
              const added = next.nodes[next.nodes.length - 1]
              if (added) {
                onModelChange({
                  ...next,
                  nodes: next.nodes.map((n) =>
                    n.id === added.id ? { ...n, parentId: dept.nodeId } : n,
                  ),
                })
              } else {
                onModelChange(next)
              }
            }}
          />
        ))}
      </div>

      {/* Mobile accordions */}
      <div className="flex flex-col gap-3 md:hidden" data-testid="department-accordions">
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
                    onAddCost={() => onModelChange(addCostNode(model))}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <ResultSpine spine={view.spine} />

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
