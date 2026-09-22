/**
 * Presentation projection: DomainModel + evaluation → workbench view model.
 * Location: src/features/cost-graph/application/project-workbench-view.ts
 */
import type { DomainModel, DomainNode, EvaluationResult, NodeId } from '@/core/model'
import { formatDerivation, inputSchemaFor } from './input-schemas'
import { isFunnelDomainNode } from './compose-funnels-into-model'

export type WorkbenchDepartmentKey =
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'support'
  | 'overhead'

export type WorkbenchCostRow = {
  nodeId: NodeId
  key: string
  label: string
  perUnit: number | null
  unresolved: boolean
  unresolvedMessage?: string
  derivationDe: string
  allocationRule: 'direct' | 'allocated' | 'none' | 'mixed'
  isFunnel: boolean
  costBehavior?: DomainNode['costBehavior']
  inputs: Record<string, number>
  schemaFields: ReturnType<typeof inputSchemaFor>['fields']
}

export type WorkbenchDepartment = {
  nodeId: NodeId
  key: string
  label: string
  tone: WorkbenchDepartmentKey
  totalPerUnit: number | null
  shareOfNetPercent: number | null
  rows: WorkbenchCostRow[]
}

export type WorkbenchSpine = {
  netRevenuePerUnit: number | null
  directPerUnit: number | null
  contributionPerUnit: number | null
  contributionMarginPercent: number | null
  allocatedPerUnit: number | null
  profitPerUnit: number | null
  marginPercent: number | null
}

export type WorkbenchView = {
  departments: WorkbenchDepartment[]
  spine: WorkbenchSpine
}

const DEPT_ORDER: { keys: string[]; tone: WorkbenchDepartmentKey }[] = [
  { keys: ['g_marketing', 'marketing', 'g_acquisition', 'acquisition'], tone: 'marketing' },
  { keys: ['g_sales', 'sales'], tone: 'sales' },
  { keys: ['g_operations', 'operations'], tone: 'operations' },
  { keys: ['g_support', 'support'], tone: 'support' },
  { keys: ['g_overhead', 'overhead'], tone: 'overhead' },
]

function perUnitOf(
  evaluation: EvaluationResult,
  nodeId: string | undefined,
): number | null {
  if (!nodeId) return null
  const v = evaluation.results[nodeId]?.value
  if (!v || v.status !== 'ok') return null
  return v.perUnit
}

function childrenOf(model: DomainModel, parentId: NodeId): DomainNode[] {
  return model.nodes.filter(
    (n) =>
      n.parentId === parentId &&
      n.enabled !== false &&
      (n.kind === 'cost' || n.kind === 'driver'),
  )
}

/**
 * Build the calculator presentation tree — independent of React Flow / ELK.
 */
export function projectWorkbenchView(
  model: DomainModel,
  evaluation: EvaluationResult,
): WorkbenchView {
  const revenue = model.nodes.find((n) => n.kind === 'revenue')
  const net = perUnitOf(evaluation, revenue?.id)

  let directPerUnit = 0
  let allocatedPerUnit = 0
  let directOk = true
  let allocatedOk = true
  for (const node of model.nodes) {
    if (node.kind !== 'cost') continue
    const r = evaluation.results[node.id]
    if (!r || r.value.status !== 'ok') {
      if (node.allocation?.rule === 'allocated') allocatedOk = false
      else directOk = false
      continue
    }
    if (r.provenance.allocationRule === 'allocated' || node.allocation?.rule === 'allocated') {
      allocatedPerUnit += r.value.perUnit
    } else {
      directPerUnit += r.value.perUnit
    }
  }

  const contribution = model.nodes.find((n) => n.key === 'contribution')
  const profit = model.nodes.find((n) => n.key === 'profit')
  const contributionPu = perUnitOf(evaluation, contribution?.id)
  const profitPu = perUnitOf(evaluation, profit?.id)

  const departments: WorkbenchDepartment[] = []
  for (const spec of DEPT_ORDER) {
    const group = model.nodes.find((n) => n.kind === 'group' && spec.keys.includes(n.key))
    if (!group) continue
    const childNodes = childrenOf(model, group.id)
    const rows: WorkbenchCostRow[] = childNodes.map((n) => {
      const result = evaluation.results[n.id]
      const unresolved = !result || result.value.status === 'unresolved'
      return {
        nodeId: n.id,
        key: n.key,
        label: n.label,
        perUnit: result?.value.status === 'ok' ? result.value.perUnit : null,
        unresolved,
        unresolvedMessage:
          result?.value.status === 'unresolved' ? result.value.message : undefined,
        derivationDe: formatDerivation(n.costBehavior, n.inputs),
        allocationRule: result?.provenance.allocationRule ?? 'none',
        isFunnel: isFunnelDomainNode(n),
        costBehavior: n.costBehavior,
        inputs: { ...n.inputs },
        schemaFields: inputSchemaFor(n.costBehavior).fields,
      }
    })

    const total = perUnitOf(evaluation, group.id)
    const share =
      net !== null && net !== 0 && total !== null ? (total / net) * 100 : null

    departments.push({
      nodeId: group.id,
      key: group.key,
      label: group.label,
      tone: spec.tone,
      totalPerUnit: total,
      shareOfNetPercent: share,
      rows,
    })
  }

  // Fallback: if group totals unresolved, sum visible rows
  for (const dept of departments) {
    if (dept.totalPerUnit === null) {
      let sum = 0
      let ok = true
      for (const row of dept.rows) {
        if (row.perUnit === null) {
          ok = false
          break
        }
        sum += row.perUnit
      }
      if (ok && dept.rows.length > 0) {
        dept.totalPerUnit = sum
        dept.shareOfNetPercent =
          net !== null && net !== 0 ? (sum / net) * 100 : null
      }
    }
  }

  return {
    departments,
    spine: {
      netRevenuePerUnit: net,
      directPerUnit: directOk ? directPerUnit : null,
      contributionPerUnit: contributionPu,
      contributionMarginPercent:
        net !== null && net !== 0 && contributionPu !== null
          ? (contributionPu / net) * 100
          : null,
      allocatedPerUnit: allocatedOk ? allocatedPerUnit : null,
      profitPerUnit: profitPu,
      marginPercent:
        net !== null && net !== 0 && profitPu !== null ? (profitPu / net) * 100 : null,
    },
  }
}
