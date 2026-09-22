/**
 * Apply resolved scenario values onto a domain model (sparse path keys).
 * Location: src/features/cost-graph/application/apply-resolved-values.ts
 */
import type { DomainModel } from '@/core/model'

const PATH = /^node\.([^.]+)\.inputs\.([^.]+)$/

/**
 * Paths like `node.ops_drivers.inputs.rate` override matching node inputs.
 */
export function applyResolvedValuesToModel(
  model: DomainModel,
  values: Record<string, number>,
): DomainModel {
  if (Object.keys(values).length === 0) return model

  let changed = false
  const nodes = model.nodes.map((n) => ({ ...n, inputs: { ...n.inputs } }))

  for (const [path, value] of Object.entries(values)) {
    const match = PATH.exec(path)
    if (!match) continue
    const nodeKey = match[1]!
    const field = match[2]!
    const idx = nodes.findIndex((n) => n.key === nodeKey)
    if (idx < 0) continue
    const node = nodes[idx]!
    if (node.inputs[field] === value) continue
    nodes[idx] = { ...node, inputs: { ...node.inputs, [field]: value } }
    changed = true
  }

  return changed ? { ...model, nodes } : model
}
