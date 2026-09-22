/**
 * Map domain nodes to Cost Graph view types (visualization only).
 * Location: src/features/cost-graph/application/view-node-type.ts
 */
import type { DomainNode } from '@/core/model'

export type CostGraphViewType =
  | 'productPrice'
  | 'revenue'
  | 'department'
  | 'costCalculator'
  | 'funnel'
  | 'result'

const DEPARTMENT_KEYS = new Set([
  'g_acquisition',
  'g_marketing',
  'g_sales',
  'g_operations',
  'g_support',
  'g_overhead',
  'acquisition',
  'marketing',
  'sales',
  'operations',
  'support',
  'overhead',
])

/**
 * Resolve visualization type without industry forks.
 */
export function resolveViewType(node: DomainNode): CostGraphViewType {
  if (node.kind === 'group' || DEPARTMENT_KEYS.has(node.key)) {
    return 'department'
  }
  if (node.kind === 'revenue' || node.key === 'revenue') {
    return node.inputs.sellingPrice !== undefined || node.inputs.taxRatePercent !== undefined
      ? 'productPrice'
      : 'revenue'
  }
  if (node.kind === 'result') {
    return 'result'
  }
  if (node.kind === 'cost' && node.key.startsWith('funnel_')) {
    return 'funnel'
  }
  if (node.kind === 'cost' || node.kind === 'driver') {
    return 'costCalculator'
  }
  return 'result'
}

export function elkSizeForViewType(
  viewType: CostGraphViewType,
  collapsed: boolean,
): { width: number; height: number } {
  if (collapsed) {
    return { width: 200, height: 64 }
  }
  switch (viewType) {
    case 'department':
      return { width: 240, height: 100 }
    case 'costCalculator':
    case 'funnel':
      return { width: 220, height: 96 }
    case 'productPrice':
    case 'revenue':
      return { width: 240, height: 110 }
    case 'result':
      return { width: 220, height: 88 }
  }
}
