/**
 * Cost graph workbench — graph-first calculator; Inspector secondary.
 * Location: src/features/cost-graph/ui/CostGraphWorkbench.tsx
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { evaluate } from '@/core/calculation'
import type { DomainModel } from '@/core/model'
import { useRepos } from '@/app/providers/ReposProvider'
import type { ProductFunnel } from '@/features/funnels'
import { GlossaryHelp } from '@/features/glossary'
import { Button, Field } from '@/shared/ui'
import { mapFunnelsToFlow } from '../application/funnel-graph-adapter'
import { layoutWithElk } from '../application/layout-with-elk'
import { mapDomainToFlow, type FlowNodeData } from '../application/map-domain-to-flow'
import { resolveViewType } from '../application/view-node-type'
import { addCostNode, updateNodeInputs } from '../application/mutate-model'
import { CostGraphNode } from './CostGraphNode'
import { HierarchyList } from './HierarchyList'
import { InspectorPanel } from './InspectorPanel'

const nodeTypes = { costGraphNode: CostGraphNode } as NodeTypes

type CostView = 'contribution' | 'fullyLoaded'

type Props = {
  model: DomainModel
  onModelChange: (next: DomainModel) => void
  templateId?: string
  /** When set, marketing/sales funnels are shown as graph nodes under departments. */
  productId?: string
}

function WorkbenchInner({ model, onModelChange, templateId, productId }: Props) {
  const repos = useRepos()
  const { fitView } = useReactFlow()
  const evaluation = useMemo(() => evaluate(model), [model])
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([])
  const [funnels, setFunnels] = useState<ProductFunnel[]>([])
  const [funnelError, setFunnelError] = useState<string | null>(null)
  const contributionNode = model.nodes.find((n) => n.key === 'contribution')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(contributionNode?.id ?? null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [costView, setCostView] = useState<CostView>('contribution')
  const [search, setSearch] = useState('')
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(() => new Set())
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!productId) {
      setFunnels([])
      setFunnelError(null)
      return
    }
    void (async () => {
      try {
        setFunnels(await repos.funnels.listByProduct(productId))
        setFunnelError(null)
      } catch {
        setFunnelError('Funnels konnten nicht geladen werden.')
        setFunnels([])
      }
    })()
  }, [productId, repos.funnels])

  const mapped = useMemo(() => {
    const domainMapped = mapDomainToFlow(model, evaluation, {
      collapsedDepartmentIds: collapsedDepartments,
      costView,
      expandedNodeIds: expandedNodes,
      onToggleExpand: (nodeId) => {
        setExpandedNodes((prev) => {
          const next = new Set(prev)
          if (next.has(nodeId)) next.delete(nodeId)
          else next.add(nodeId)
          return next
        })
      },
      onInputChange: (nodeId, fieldId, value) => {
        onModelChange(updateNodeInputs(model, nodeId, { [fieldId]: value }))
      },
    })

    const funnelMapped = mapFunnelsToFlow(model, funnels, {
      collapsedDepartmentIds: collapsedDepartments,
      expandedNodeIds: expandedNodes,
      onToggleExpand: (nodeId) => {
        setExpandedNodes((prev) => {
          const next = new Set(prev)
          if (next.has(nodeId)) next.delete(nodeId)
          else next.add(nodeId)
          return next
        })
      },
      onFunnelCostChange: (funnelId, patch) => {
        void (async () => {
          try {
            const updated = await repos.funnels.update(funnelId, patch)
            setFunnels((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
            setFunnelError(null)
          } catch {
            setFunnelError('Funnel-Änderung konnte nicht gespeichert werden.')
          }
        })()
      },
    })

    return {
      nodes: [...domainMapped.nodes, ...funnelMapped.nodes] as Node<FlowNodeData>[],
      edges: [...domainMapped.edges, ...funnelMapped.edges] as Edge[],
    }
  }, [
    model,
    evaluation,
    collapsedDepartments,
    costView,
    expandedNodes,
    onModelChange,
    funnels,
    repos.funnels,
  ])

  const filteredMapped = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mapped
    const matched = new Set(
      mapped.nodes.filter((n) => n.data.label.toLowerCase().includes(q)).map((n) => n.id),
    )
    return {
      nodes: mapped.nodes.filter((n) => matched.has(n.id)),
      edges: mapped.edges.filter((e) => matched.has(e.source) && matched.has(e.target)),
    }
  }, [mapped, search])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const layouted = await layoutWithElk(filteredMapped.nodes, filteredMapped.edges)
        if (!cancelled) {
          setNodes(layouted)
          setLayoutError(null)
          requestAnimationFrame(() => {
            void fitView({ padding: 0.2, duration: 0 })
          })
        }
      } catch {
        if (!cancelled) {
          setNodes(filteredMapped.nodes)
          setLayoutError('Automatisches Layout nicht verfügbar — Fallback-Positionen.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [filteredMapped, fitView])

  const revenueNode = model.nodes.find((n) => n.key === 'revenue')
  const revenue = revenueNode ? evaluation.results[revenueNode.id] : undefined
  const contribution = contributionNode ? evaluation.results[contributionNode.id] : undefined

  let directPeriod = 0
  let allocatedPeriod = 0
  for (const r of Object.values(evaluation.results)) {
    const node = model.nodes.find((n) => n.id === r.nodeId)
    if (node?.kind !== 'cost' || r.value.status !== 'ok') continue
    if (r.provenance.allocationRule === 'allocated') {
      allocatedPeriod += r.value.periodTotal
    } else {
      directPeriod += r.value.periodTotal
    }
  }

  const departments = model.nodes.filter((n) => resolveViewType(n) === 'department')

  function toggleDepartment(id: string) {
    setCollapsedDepartments((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label="Nettoerlös"
            termId="contribution"
            value={
              revenue?.value.status === 'ok'
                ? `${revenue.value.periodTotal.toFixed(2)}`
                : 'Unvollständig'
            }
          />
          <Kpi
            label="Direkte Kosten"
            value={directPeriod.toFixed(2)}
            hint="ohne Alloziertes"
          />
          <Kpi
            label={costView === 'contribution' ? 'Deckungsbeitrag' : 'Fully Loaded'}
            termId="contribution"
            value={
              costView === 'contribution'
                ? contribution?.value.status === 'ok'
                  ? `${contribution.value.periodTotal.toFixed(2)}`
                  : 'Unvollständig'
                : (revenue?.value.status === 'ok'
                    ? (revenue.value.periodTotal - directPeriod - allocatedPeriod).toFixed(2)
                    : 'Unvollständig')
            }
          />
          <Kpi
            label="Alloziierte Kosten"
            value={
              costView === 'fullyLoaded'
                ? allocatedPeriod.toFixed(2)
                : 'ausgeblendet'
            }
            hint="nur Fully-Loaded-Ansicht"
          />
        </div>
        <Button
          onClick={() => {
            const next = addCostNode(model)
            onModelChange(next)
            const added = next.nodes[next.nodes.length - 1]
            if (added) setSelectedNodeId(added.id)
          }}
        >
          Kostenposition hinzufügen
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-3">
        <div className="flex gap-2" role="group" aria-label="Kostenansicht">
          <Button
            variant={costView === 'contribution' ? 'primary' : 'ghost'}
            onClick={() => setCostView('contribution')}
          >
            Contribution
          </Button>
          <Button
            variant={costView === 'fullyLoaded' ? 'primary' : 'ghost'}
            onClick={() => setCostView('fullyLoaded')}
          >
            Fully Loaded
          </Button>
        </div>
        <Field
          label="Suche im Graph"
          name="graphSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Fahrer, Operations…"
        />
        <Button variant="ghost" onClick={() => setInspectorOpen((o) => !o)}>
          {inspectorOpen ? 'Inspector schließen' : 'Inspector (Advanced)'}
        </Button>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              className="rounded-md border border-[color:var(--line-default)] bg-white px-2 py-1 text-xs"
              aria-pressed={collapsedDepartments.has(d.id)}
              onClick={() => toggleDepartment(d.id)}
            >
              {d.label} {collapsedDepartments.has(d.id) ? '▶' : '▼'}
            </button>
          ))}
        </div>
      </div>

      {layoutError ? (
        <p className="text-sm text-[color:var(--semantic-warning)]" role="status">
          {layoutError}
        </p>
      ) : null}
      {funnelError ? (
        <p className="text-sm text-[color:var(--semantic-cost)]" role="alert">
          {funnelError}
        </p>
      ) : null}
      {productId && funnels.length === 0 && !funnelError ? (
        <p className="text-sm text-[color:var(--ink-muted)]" role="status">
          Keine Funnels im Graph — legen Sie Marketing-/Sales-Funnels unten an, dann erscheinen sie
          unter dem jeweiligen Department.
        </p>
      ) : null}

      <div
        className={`grid gap-4 ${
          inspectorOpen ? 'lg:grid-cols-[1fr_300px]' : 'lg:grid-cols-1'
        }`}
      >
        <div className="hidden h-[640px] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] md:block">
          <ReactFlow
            nodes={nodes}
            edges={filteredMapped.edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id)
              const data = node.data as FlowNodeData
              if (data.viewType === 'department') {
                toggleDepartment(node.id)
              }
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <HierarchyList
          model={model}
          evaluation={evaluation}
          selectedNodeId={selectedNodeId}
          onSelect={(id) => {
            setSelectedNodeId(id)
          }}
        />

        {inspectorOpen ? (
          <InspectorPanel
            model={model}
            selectedNodeId={selectedNodeId}
            results={evaluation.results}
            onModelChange={onModelChange}
            onSelectNode={setSelectedNodeId}
            templateId={templateId}
          />
        ) : (
          <p className="hidden text-sm text-[color:var(--ink-muted)] lg:block">
            Inspector ist sekundär — normale Kosten werden später direkt im Node bearbeitet.
            Öffnen Sie „Inspector (Advanced)“ für Formel/Allokation.
          </p>
        )}
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  termId,
  hint,
}: {
  label: string
  value: string
  termId?: string
  hint?: string
}) {
  return (
    <div data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="flex items-center text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">
        {label}
        {termId ? <GlossaryHelp termId={termId} /> : null}
      </p>
      <p
        className="font-variant-numeric text-xl font-semibold tabular-nums"
        data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}-value`}
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-[color:var(--ink-muted)]">{hint}</p> : null}
    </div>
  )
}

export function CostGraphWorkbench({ model, onModelChange, templateId, productId }: Props) {
  return (
    <ReactFlowProvider>
      <WorkbenchInner
        model={model}
        onModelChange={onModelChange}
        templateId={templateId}
        productId={productId}
      />
    </ReactFlowProvider>
  )
}
