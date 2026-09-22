/**
 * Apply a shipped template into a product DomainModel instance (never mutates JSON).
 * Location: src/features/templates/application/apply-template.ts
 */
import type { DomainEdge, DomainModel, DomainNode } from '@/core/model'
import type { Product } from '@/features/products/domain/product'
import {
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
  type ShippedTemplate,
  type TemplateLayer,
} from '../domain/template-schema'
import { getShippedTemplate } from './load-templates'

export type ApplyTemplateOptions = {
  /** Optional cost node keys to include; defaults to all suggested optionals. */
  includedOptionalKeys?: string[]
  volume?: number
  /** Override revenue price from product when set. */
  price?: number
}

function nodeIdFor(productId: string, key: string): string {
  return `n_${productId}_${key}`
}

function edgeIdFor(productId: string, sourceKey: string, targetKey: string): string {
  return `e_${productId}_${sourceKey}_${targetKey}`
}

/**
 * Build a connected DomainModel from a validated shipped template.
 * Removing included keys only affects the returned instance.
 */
export function applyShippedTemplate(
  template: ShippedTemplate,
  product: Product,
  options: ApplyTemplateOptions = {},
): DomainModel {
  const included = new Set(
    options.includedOptionalKeys ??
      template.nodes.filter((n) => !n.required && n.suggested).map((n) => n.key),
  )

  const selectedKeys = new Set<string>()
  for (const node of template.nodes) {
    if (node.required || included.has(node.key)) {
      selectedKeys.add(node.key)
    }
  }

  // Drop group keys that would have no cost/driver children after filtering
  for (const node of template.nodes) {
    if (node.kind !== 'group') continue
    const hasChild = template.nodes.some(
      (child) =>
        child.key !== node.key &&
        selectedKeys.has(child.key) &&
        child.layerKey === node.layerKey &&
        (child.kind === 'cost' || child.kind === 'driver'),
    )
    if (!hasChild && !node.required) {
      selectedKeys.delete(node.key)
    }
  }

  const price = options.price ?? product.price ?? template.nodes.find((n) => n.key === 'revenue')?.inputs.price ?? 0

  const nodes: DomainNode[] = []
  for (const tNode of template.nodes) {
    if (!selectedKeys.has(tNode.key)) continue
    const id = nodeIdFor(product.id, tNode.key)
    const parentLayer = tNode.layerKey
      ? template.nodes.find((n) => n.kind === 'group' && n.layerKey === tNode.layerKey)
      : undefined
    const parentId =
      parentLayer && selectedKeys.has(parentLayer.key) && tNode.kind !== 'group'
        ? nodeIdFor(product.id, parentLayer.key)
        : undefined

    const inputs = { ...tNode.inputs }
    if (tNode.key === 'revenue') {
      inputs.price = price
    }

    nodes.push({
      id,
      kind: tNode.kind,
      key: tNode.key,
      label: tNode.labelDe,
      enabled: true,
      parentId,
      costBehavior: tNode.costBehavior,
      inputs,
      formulaRef: tNode.formulaRef,
      allocation: tNode.allocation
        ? { rule: tNode.allocation.rule, strategy: tNode.allocation.strategy }
        : undefined,
    })
  }

  const edges: DomainEdge[] = []
  for (const tEdge of template.edges) {
    if (!selectedKeys.has(tEdge.sourceKey) || !selectedKeys.has(tEdge.targetKey)) continue
    edges.push({
      id: edgeIdFor(product.id, tEdge.sourceKey, tEdge.targetKey),
      sourceNodeId: nodeIdFor(product.id, tEdge.sourceKey),
      targetNodeId: nodeIdFor(product.id, tEdge.targetKey),
      relation: tEdge.relation,
    })
  }

  return {
    id: `model_${product.id}`,
    version: template.version,
    volume: options.volume ?? template.defaultVolume,
    nodes,
    edges,
  }
}

export function applyTemplateById(
  templateId: string,
  product: Product,
  options: ApplyTemplateOptions & { customDefinition?: ShippedTemplate } = {},
): DomainModel {
  const template = options.customDefinition ?? getShippedTemplate(templateId)
  if (
    !options.customDefinition &&
    product.templateVersion !== undefined &&
    product.templateVersion !== template.version
  ) {
    throw new UnsupportedTemplateVersionError(
      templateId,
      product.templateVersion,
      `Gespeicherte Vorlagenversion ${product.templateVersion} weicht von der ausgelieferten Version ${template.version} ab.`,
    )
  }
  return applyShippedTemplate(template, product, {
    ...options,
    includedOptionalKeys: options.includedOptionalKeys ?? product.includedOptionalKeys,
  })
}

export function isCustomTemplateId(templateId: string): boolean {
  return templateId.startsWith('custom_')
}

export function getLayerGuidance(
  templateId: string,
  layerKey: string,
): TemplateLayer['guidance'] | null {
  try {
    const template = getShippedTemplate(templateId)
    return template.layers.find((l) => l.key === layerKey)?.guidance ?? null
  } catch (err) {
    if (err instanceof UnknownTemplateError || err instanceof UnsupportedTemplateVersionError) {
      return null
    }
    throw err
  }
}

export function resolveTemplateId(product: Product): string {
  return product.templateId ?? 'custom'
}
