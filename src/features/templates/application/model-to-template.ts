/**
 * Convert a product DomainModel into a reusable template definition (copy, not mutation).
 * Location: src/features/templates/application/model-to-template.ts
 */
import type { DomainModel } from '@/core/model'
import type { ShippedTemplate, TemplateNode } from '../domain/template-schema'

const STRUCTURAL = new Set(['revenue', 'contribution', 'profit'])

/**
 * Snapshot the current product graph into a shipped-compatible template definition.
 * Does not touch shipped JSON files.
 */
export function domainModelToTemplateDefinition(
  model: DomainModel,
  meta: { id: string; name: string },
): ShippedTemplate {
  const nodes: TemplateNode[] = model.nodes.map((n) => ({
    key: n.key,
    kind: n.kind,
    labelDe: n.label,
    required: STRUCTURAL.has(n.key) || n.kind === 'group' || n.kind === 'result',
    suggested: true,
    layerKey:
      n.parentId !== undefined
        ? model.nodes.find((p) => p.id === n.parentId)?.key?.replace(/^g_/, '')
        : n.key.startsWith('g_')
          ? n.key.slice(2)
          : undefined,
    costBehavior: n.costBehavior,
    inputs: { ...n.inputs },
    formulaRef: n.formulaRef,
    allocation: n.allocation
      ? { rule: n.allocation.rule, strategy: n.allocation.strategy }
      : undefined,
  }))

  const keyById = new Map(model.nodes.map((n) => [n.id, n.key]))
  const edges = model.edges
    .map((e) => {
      const sourceKey = keyById.get(e.sourceNodeId)
      const targetKey = keyById.get(e.targetNodeId)
      if (!sourceKey || !targetKey) return null
      return {
        sourceKey,
        targetKey,
        relation: e.relation,
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)

  return {
    id: meta.id,
    version: 1,
    industry: 'custom',
    labelDe: meta.name,
    descriptionDe: `Eigene Vorlage „${meta.name}“`,
    defaultVolume: model.volume,
    layers: [
      {
        key: 'operations',
        labelDe: 'Betrieb',
        guidance: {
          generalDe: 'Kosten für die Erbringung des verkauften Produkts oder der Dienstleistung.',
          commonExamplesDe: [],
          industryExamplesDe: [],
        },
      },
    ],
    nodes,
    edges,
  }
}
