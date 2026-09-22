/**
 * Pure domain-model mutations for product instance editing (never mutates shipped templates).
 * Location: src/features/cost-graph/application/mutate-model.ts
 */
import type { CostBehavior, DomainModel, DomainNode, NodeId } from '@/core/model'

const STRUCTURAL_KEYS = new Set(['revenue', 'contribution', 'profit'])

export function isOptionalCostNode(node: DomainNode): boolean {
  return node.kind === 'cost' && !STRUCTURAL_KEYS.has(node.key)
}

export function updateNodeLabel(model: DomainModel, nodeId: NodeId, label: string): DomainModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => (n.id === nodeId ? { ...n, label } : n)),
  }
}

export function updateNodeEnabled(model: DomainModel, nodeId: NodeId, enabled: boolean): DomainModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => (n.id === nodeId ? { ...n, enabled } : n)),
  }
}

export function updateNodeInputs(
  model: DomainModel,
  nodeId: NodeId,
  inputs: Record<string, number>,
): DomainModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => (n.id === nodeId ? { ...n, inputs: { ...n.inputs, ...inputs } } : n)),
  }
}

export function updateNodeBehavior(
  model: DomainModel,
  nodeId: NodeId,
  costBehavior: CostBehavior,
): DomainModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => (n.id === nodeId ? { ...n, costBehavior } : n)),
  }
}

export function updateNodeFormula(
  model: DomainModel,
  nodeId: NodeId,
  formulaRef: string | undefined,
): DomainModel {
  return {
    ...model,
    nodes: model.nodes.map((n) => {
      if (n.id !== nodeId) return n
      if (formulaRef === undefined || formulaRef.trim() === '') {
        const { formulaRef: _removed, ...rest } = n
        void _removed
        return { ...rest }
      }
      return { ...n, formulaRef }
    }),
  }
}

export function removeNode(model: DomainModel, nodeId: NodeId): DomainModel {
  const node = model.nodes.find((n) => n.id === nodeId)
  if (!node || !isOptionalCostNode(node)) {
    return model
  }
  return {
    ...model,
    nodes: model.nodes.filter((n) => n.id !== nodeId),
    edges: model.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId),
  }
}

export function duplicateNode(model: DomainModel, nodeId: NodeId): DomainModel {
  const node = model.nodes.find((n) => n.id === nodeId)
  if (!node || !isOptionalCostNode(node)) return model

  const newId = `${nodeId}_copy_${crypto.randomUUID().slice(0, 8)}`
  const copy: DomainNode = {
    ...node,
    id: newId,
    key: `${node.key}_copy`,
    label: `${node.label} (Kopie)`,
    inputs: { ...node.inputs },
    allocation: node.allocation ? { ...node.allocation } : undefined,
  }

  const contribution = model.nodes.find((n) => n.key === 'contribution')
  const edges = [...model.edges]
  if (contribution) {
    edges.push({
      id: `e_${newId}`,
      sourceNodeId: newId,
      targetNodeId: contribution.id,
      relation: 'feeds',
    })
  }

  return {
    ...model,
    nodes: [...model.nodes, copy],
    edges,
  }
}

export function addCostNode(
  model: DomainModel,
  partial?: Partial<Pick<DomainNode, 'label' | 'costBehavior' | 'inputs'>>,
): DomainModel {
  const newId = `n_cost_${crypto.randomUUID().slice(0, 8)}`
  const node: DomainNode = {
    id: newId,
    kind: 'cost',
    key: `cost_${newId}`,
    label: partial?.label ?? 'Neue Kostenposition',
    enabled: true,
    costBehavior: partial?.costBehavior ?? 'per_order',
    inputs: partial?.inputs ?? { rate: 0 },
    allocation: { rule: 'direct' },
  }
  const contribution = model.nodes.find((n) => n.key === 'contribution')
  const edges = [...model.edges]
  if (contribution) {
    edges.push({
      id: `e_${newId}`,
      sourceNodeId: newId,
      targetNodeId: contribution.id,
      relation: 'feeds',
    })
  }
  return {
    ...model,
    nodes: [...model.nodes, node],
    edges,
  }
}

export const COST_BEHAVIOR_OPTIONS: { value: CostBehavior; labelDe: string; unitHint: string }[] = [
  { value: 'per_unit', labelDe: 'Pro Einheit', unitHint: 'EUR / Stück' },
  { value: 'per_order', labelDe: 'Pro Auftrag', unitHint: 'EUR / Auftrag' },
  { value: 'per_customer', labelDe: 'Pro Kunde', unitHint: 'EUR / Kunde' },
  { value: 'per_employee', labelDe: 'Pro Mitarbeiter', unitHint: 'EUR / MA' },
  { value: 'per_hour', labelDe: 'Stundensatz', unitHint: 'EUR / Stunde · Stunden/Auftrag' },
  { value: 'per_km', labelDe: 'Pro km', unitHint: 'EUR / km' },
  { value: 'per_stop', labelDe: 'Pro Stopp', unitHint: 'EUR / Stopp' },
  { value: 'per_transaction', labelDe: 'Pro Transaktion', unitHint: 'EUR / Tx' },
  { value: 'per_click', labelDe: 'Pro Klick', unitHint: 'EUR / Klick' },
  { value: 'per_api_call', labelDe: 'Pro API-Call', unitHint: 'EUR / Call' },
  { value: 'percentage_revenue', labelDe: '% vom Umsatz', unitHint: '%' },
  { value: 'fixed_period', labelDe: 'Fix pro Periode', unitHint: 'EUR / Periode' },
  { value: 'custom_formula', labelDe: 'Eigene Formel', unitHint: 'Formelausdruck' },
]
