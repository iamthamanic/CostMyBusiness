/**
 * Shared domain model contracts for the calculation graph.
 * Location: src/core/model/types.ts
 */

export type NodeId = string
export type EdgeId = string

export type NodeKind =
  | 'revenue'
  | 'cost'
  | 'driver'
  | 'result'
  | 'group'
  | 'metric'

export type CostBehavior =
  | 'per_unit'
  | 'per_order'
  | 'per_customer'
  | 'per_employee'
  | 'per_hour'
  | 'per_km'
  | 'per_stop'
  | 'per_transaction'
  | 'per_click'
  | 'per_api_call'
  | 'percentage_revenue'
  | 'fixed_period'
  | 'custom_formula'

export type DomainNode = {
  id: NodeId
  kind: NodeKind
  /** Stable machine id — never derived from label. */
  key: string
  label: string
  enabled: boolean
  /** Optional parent group for hierarchy. */
  parentId?: NodeId
  costBehavior?: CostBehavior
  /** Scalar inputs keyed by stable field id. */
  inputs: Record<string, number>
  formulaRef?: string
  allocation?: {
    rule: 'direct' | 'allocated'
    sourcePoolId?: NodeId
    strategy?: string
  }
}

export type DomainEdge = {
  id: EdgeId
  sourceNodeId: NodeId
  targetNodeId: NodeId
  relation: 'feeds' | 'allocates_to' | 'depends_on'
}

export type DomainModel = {
  id: string
  version: number
  nodes: DomainNode[]
  edges: DomainEdge[]
  /** Units sold / orders in the active period — drives per-unit totals. */
  volume: number
}

export type UnresolvedReason =
  | 'missing_input'
  | 'divide_by_zero'
  | 'cycle'
  | 'disabled'
  | 'unknown'

export type CalcValue =
  | { status: 'ok'; perUnit: number; periodTotal: number }
  | { status: 'unresolved'; reason: UnresolvedReason; message: string }

export type NodeResult = {
  nodeId: NodeId
  value: CalcValue
  provenance: {
    allocationRule: 'direct' | 'allocated' | 'mixed' | 'none'
    sourcePoolId?: NodeId
  }
}

export type EvaluationResult = {
  results: Record<NodeId, NodeResult>
  order: NodeId[]
}

export class CycleError extends Error {
  readonly code = 'CYCLE' as const
  constructor(readonly nodeIds: NodeId[]) {
    super(`Calculation cycle detected: ${nodeIds.join(' -> ')}`)
    this.name = 'CycleError'
  }
}
