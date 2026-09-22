/**
 * Pure dependency-graph evaluation for domain models.
 * Location: src/core/calculation/evaluate.ts
 */
import {
  CycleError,
  type CalcValue,
  type DomainModel,
  type DomainNode,
  type EvaluationResult,
  type NodeId,
  type NodeResult,
} from '@/core/model'
import { runFormula } from '@/core/formulas'

function buildAdjacency(model: DomainModel): Map<NodeId, NodeId[]> {
  const deps = new Map<NodeId, NodeId[]>()
  for (const node of model.nodes) {
    deps.set(node.id, [])
  }
  for (const edge of model.edges) {
    const list = deps.get(edge.targetNodeId)
    if (list) {
      list.push(edge.sourceNodeId)
    }
  }
  return deps
}

/** Kahn topological sort; throws CycleError if cyclic. */
export function topologicalOrder(model: DomainModel): NodeId[] {
  const deps = buildAdjacency(model)
  const indegree = new Map<NodeId, number>()
  const dependents = new Map<NodeId, NodeId[]>()

  for (const id of deps.keys()) {
    indegree.set(id, 0)
    dependents.set(id, [])
  }

  for (const [target, sources] of deps) {
    indegree.set(target, sources.length)
    for (const source of sources) {
      dependents.get(source)?.push(target)
    }
  }

  const queue: NodeId[] = []
  for (const [id, degree] of indegree) {
    if (degree === 0) queue.push(id)
  }

  const order: NodeId[] = []
  while (queue.length > 0) {
    const id = queue.shift()
    if (!id) break
    order.push(id)
    for (const next of dependents.get(id) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1
      indegree.set(next, nextDegree)
      if (nextDegree === 0) queue.push(next)
    }
  }

  if (order.length !== model.nodes.length) {
    const remaining = model.nodes.map((n) => n.id).filter((id) => !order.includes(id))
    throw new CycleError(remaining)
  }

  return order
}

function unresolved(
  reason: 'missing_input' | 'divide_by_zero' | 'cycle' | 'disabled' | 'unknown',
  message: string,
): CalcValue {
  return { status: 'unresolved', reason, message }
}

function liveRevenuePerUnit(
  model: DomainModel,
  results: Map<NodeId, NodeResult>,
): number | undefined {
  for (const node of model.nodes) {
    if (node.kind !== 'revenue') continue
    const r = results.get(node.id)
    if (r?.value.status === 'ok') return r.value.perUnit
    if (typeof node.inputs.price === 'number' && Number.isFinite(node.inputs.price)) {
      return node.inputs.price
    }
  }
  return undefined
}

function computeLeaf(
  node: DomainNode,
  volume: number,
  model: DomainModel,
  results: Map<NodeId, NodeResult>,
): CalcValue {
  if (!node.enabled) {
    return unresolved('disabled', `Node ${node.key} is disabled`)
  }

  if (node.kind === 'revenue') {
    const price = node.inputs.price
    const units = node.inputs.units ?? volume
    if (price === undefined || Number.isNaN(price)) {
      return unresolved('missing_input', 'Revenue requires price')
    }
    return { status: 'ok', perUnit: price, periodTotal: price * units }
  }

  if (node.kind === 'driver') {
    const quantity = node.inputs.quantity
    if (quantity === undefined) {
      return unresolved('missing_input', 'Driver requires quantity')
    }
    return { status: 'ok', perUnit: quantity, periodTotal: quantity * Math.max(volume, 1) }
  }

  if (node.kind === 'cost') {
    // Custom formula overrides behavior when present (restricted AST only).
    if (node.formulaRef && node.formulaRef.trim() !== '') {
      const revenue = liveRevenuePerUnit(model, results)
      const scope: Record<string, number> = { ...node.inputs }
      if (revenue !== undefined) {
        scope.revenue = revenue
        scope.revenuePerUnit = revenue
      }
      try {
        const evaluated = runFormula(node.formulaRef, scope)
        if (evaluated.status !== 'ok') {
          return unresolved(
            evaluated.reason === 'divide_by_zero' ? 'divide_by_zero' : 'missing_input',
            evaluated.message,
          )
        }
        const perUnit = evaluated.value
        return { status: 'ok', perUnit, periodTotal: perUnit * volume }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Formel ungültig'
        return unresolved('unknown', message)
      }
    }

    const behavior = node.costBehavior ?? 'fixed_period'
    if (behavior === 'fixed_period') {
      const amount = node.inputs.amount
      if (amount === undefined) return unresolved('missing_input', 'Fixed cost requires amount')
      const perUnit = volume === 0 ? 0 : amount / volume
      return { status: 'ok', perUnit, periodTotal: amount }
    }
    if (behavior === 'per_hour') {
      const rate = node.inputs.rate
      if (rate === undefined) {
        return unresolved('missing_input', 'Stundensatz (rate) fehlt')
      }
      let hoursPerOrder: number | undefined
      if (node.inputs.hoursPerStop !== undefined && node.inputs.stopsPerOrder !== undefined) {
        hoursPerOrder = node.inputs.hoursPerStop * node.inputs.stopsPerOrder
      } else {
        hoursPerOrder = node.inputs.hoursPerOrder
      }
      if (hoursPerOrder === undefined) {
        return unresolved(
          'missing_input',
          'Stunden/Auftrag oder Stunden/Stopp × Stopps/Auftrag erforderlich',
        )
      }
      const perUnit = rate * hoursPerOrder
      return { status: 'ok', perUnit, periodTotal: perUnit * volume }
    }
    if (behavior === 'per_km' || behavior === 'per_stop') {
      const rate = node.inputs.rate
      if (rate === undefined) return unresolved('missing_input', 'Unit cost requires rate')
      const quantity = node.inputs.quantity
      if (quantity === undefined) {
        return { status: 'ok', perUnit: rate, periodTotal: rate * volume }
      }
      const perUnit = rate * quantity
      return { status: 'ok', perUnit, periodTotal: perUnit * volume }
    }
    if (
      behavior === 'per_unit' ||
      behavior === 'per_order' ||
      behavior === 'per_customer' ||
      behavior === 'per_employee' ||
      behavior === 'per_transaction' ||
      behavior === 'per_click' ||
      behavior === 'per_api_call'
    ) {
      const rate = node.inputs.rate
      if (rate === undefined) return unresolved('missing_input', 'Unit cost requires rate')
      return { status: 'ok', perUnit: rate, periodTotal: rate * volume }
    }
    if (behavior === 'percentage_revenue') {
      const percentage = node.inputs.percentage
      if (percentage === undefined) {
        return unresolved('missing_input', 'Percentage cost requires percentage')
      }
      const revenuePerUnit =
        liveRevenuePerUnit(model, results) ?? node.inputs.revenuePerUnit
      if (revenuePerUnit === undefined) {
        return unresolved(
          'missing_input',
          'Percentage cost requires live revenue or revenuePerUnit',
        )
      }
      const perUnit = (revenuePerUnit * percentage) / 100
      return { status: 'ok', perUnit, periodTotal: perUnit * volume }
    }
    if (behavior === 'custom_formula') {
      const rate = node.inputs.rate
      if (rate === undefined) {
        return unresolved('missing_input', 'Custom formula cost requires rate fallback or formula')
      }
      return { status: 'ok', perUnit: rate, periodTotal: rate * volume }
    }
    return unresolved('unknown', `Unsupported cost behavior: ${behavior}`)
  }

  return unresolved('unknown', `Unsupported leaf kind: ${node.kind}`)
}

function sumGroup(upstreamIds: NodeId[], results: Map<NodeId, NodeResult>): CalcValue {
  let periodTotal = 0
  let perUnit = 0
  let sawOk = false
  for (const id of upstreamIds) {
    const up = results.get(id)
    if (!up) return unresolved('missing_input', `Missing upstream ${id}`)
    if (up.value.status !== 'ok') {
      return unresolved(up.value.reason, up.value.message)
    }
    sawOk = true
    periodTotal += up.value.periodTotal
    perUnit += up.value.perUnit
  }
  if (!sawOk) return unresolved('missing_input', 'Group has no upstream values')
  return { status: 'ok', perUnit, periodTotal }
}

/** Contribution = net revenue − direct costs among upstreams. */
function computeContribution(
  upstreamIds: NodeId[],
  nodeById: Map<NodeId, DomainNode>,
  results: Map<NodeId, NodeResult>,
): CalcValue {
  let revenuePeriod = 0
  let revenuePu = 0
  let costPeriod = 0
  let costPu = 0

  for (const id of upstreamIds) {
    const srcNode = nodeById.get(id)
    const srcResult = results.get(id)
    if (!srcNode || !srcResult) {
      return unresolved('missing_input', `Missing upstream ${id}`)
    }
    if (srcResult.value.status !== 'ok') {
      return unresolved(srcResult.value.reason, srcResult.value.message)
    }
    if (srcNode.kind === 'revenue') {
      revenuePeriod += srcResult.value.periodTotal
      revenuePu += srcResult.value.perUnit
    } else {
      costPeriod += srcResult.value.periodTotal
      costPu += srcResult.value.perUnit
    }
  }

  return {
    status: 'ok',
    perUnit: revenuePu - costPu,
    periodTotal: revenuePeriod - costPeriod,
  }
}

/**
 * Fully loaded profit = contribution − allocated overhead (and other non-base upstream costs).
 * Upstream result nodes (e.g. contribution) are the positive base — never treated as costs.
 */
function computeFullyLoadedProfit(
  upstreamIds: NodeId[],
  nodeById: Map<NodeId, DomainNode>,
  results: Map<NodeId, NodeResult>,
): CalcValue {
  let basePeriod = 0
  let basePu = 0
  let costPeriod = 0
  let costPu = 0
  let hasBase = false

  for (const id of upstreamIds) {
    const srcNode = nodeById.get(id)
    const srcResult = results.get(id)
    if (!srcNode || !srcResult) {
      return unresolved('missing_input', `Missing upstream ${id}`)
    }
    if (srcResult.value.status !== 'ok') {
      return unresolved(srcResult.value.reason, srcResult.value.message)
    }
    if (srcNode.kind === 'result' || srcNode.kind === 'revenue') {
      hasBase = true
      basePeriod += srcResult.value.periodTotal
      basePu += srcResult.value.perUnit
    } else {
      costPeriod += srcResult.value.periodTotal
      costPu += srcResult.value.perUnit
    }
  }

  if (!hasBase) {
    return unresolved('missing_input', 'Profit requires contribution (or revenue) upstream')
  }

  return {
    status: 'ok',
    perUnit: basePu - costPu,
    periodTotal: basePeriod - costPeriod,
  }
}

/**
 * Evaluate a domain model deterministically.
 * Never returns Infinity/NaN — uses unresolved results instead.
 */
export function evaluate(model: DomainModel): EvaluationResult {
  const order = topologicalOrder(model)
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]))
  const deps = buildAdjacency(model)
  const results = new Map<NodeId, NodeResult>()

  for (const nodeId of order) {
    const node = nodeById.get(nodeId)
    if (!node) continue

    const upstreamIds = deps.get(nodeId) ?? []
    let value: CalcValue

    if (!node.enabled) {
      value = unresolved('disabled', `Node ${node.key} is disabled`)
    } else if (node.kind === 'result' && node.key === 'contribution') {
      value = computeContribution(upstreamIds, nodeById, results)
    } else if (node.kind === 'result' && (node.key === 'profit' || node.key === 'fully_loaded_profit')) {
      value = computeFullyLoadedProfit(upstreamIds, nodeById, results)
    } else if (node.kind === 'result' && node.key === 'margin') {
      const profitId = upstreamIds.find((id) => nodeById.get(id)?.key === 'profit')
      const revenueNode = model.nodes.find((n) => n.kind === 'revenue')
      const profit = profitId ? results.get(profitId) : undefined
      const revenue = revenueNode ? results.get(revenueNode.id) : undefined
      if (
        profit?.value.status === 'ok' &&
        revenue?.value.status === 'ok' &&
        revenue.value.perUnit !== 0
      ) {
        const ratio = profit.value.perUnit / revenue.value.perUnit
        value = {
          status: 'ok',
          perUnit: ratio * 100,
          periodTotal: ratio * 100,
        }
      } else if (profit?.value.status === 'unresolved') {
        value = profit.value
      } else {
        value = unresolved('missing_input', 'Marge benötigt Gewinn und Nettoerlös')
      }
    } else if (node.kind === 'group' || node.kind === 'metric' || node.kind === 'result') {
      value = sumGroup(upstreamIds, results)
    } else {
      value = computeLeaf(node, model.volume, model, results)
    }

    if (value.status === 'ok') {
      if (!Number.isFinite(value.perUnit) || !Number.isFinite(value.periodTotal)) {
        value = unresolved('divide_by_zero', 'Non-finite calculation result')
      }
    }

    const allocationRule =
      node.allocation?.rule === 'allocated'
        ? 'allocated'
        : node.kind === 'cost'
          ? 'direct'
          : 'none'

    results.set(nodeId, {
      nodeId,
      value,
      provenance: {
        allocationRule,
        sourcePoolId: node.allocation?.sourcePoolId,
      },
    })
  }

  const out: Record<NodeId, NodeResult> = {}
  for (const [id, result] of results) {
    out[id] = result
  }

  return { results: out, order }
}
