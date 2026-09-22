/**
 * Load and catalog shipped industry templates (Zod-validated).
 * Location: src/features/templates/application/load-templates.ts
 */
import customJson from '@/data/default-templates/custom.v1.json'
import ecommerceJson from '@/data/default-templates/ecommerce.v1.json'
import saasJson from '@/data/default-templates/saas.v1.json'
import serviceJson from '@/data/default-templates/service.v1.json'
import trafficSafetyJson from '@/data/default-templates/traffic-safety.v1.json'
import {
  ShippedTemplateSchema,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
  type ShippedTemplate,
  type TemplateNode,
} from '../domain/template-schema'

const SUPPORTED_VERSION = 1

const RAW_TEMPLATES: unknown[] = [
  saasJson,
  ecommerceJson,
  serviceJson,
  trafficSafetyJson,
  customJson,
]

const catalog: ShippedTemplate[] = RAW_TEMPLATES.map((raw) => ShippedTemplateSchema.parse(raw))

/** Deep-frozen-ish copies for callers — never expose mutable catalog entries. */
export function listShippedTemplates(): ShippedTemplate[] {
  return catalog.map((t) => structuredClone(t))
}

export function getShippedTemplate(id: string): ShippedTemplate {
  const found = catalog.find((t) => t.id === id)
  if (!found) {
    throw new UnknownTemplateError(
      id,
      `Unbekannte Vorlage „${id}“. Bitte eine der ausgelieferten Branchenvorlagen wählen.`,
    )
  }
  if (found.version !== SUPPORTED_VERSION) {
    throw new UnsupportedTemplateVersionError(
      id,
      found.version,
      `Vorlagenversion ${found.version} für „${id}“ wird nicht unterstützt (erwartet ${SUPPORTED_VERSION}).`,
    )
  }
  return structuredClone(found)
}

export function listSuggestedOptionalNodes(template: ShippedTemplate): TemplateNode[] {
  return template.nodes.filter((n) => !n.required && n.suggested && n.kind === 'cost')
}

export function defaultIncludedOptionalKeys(template: ShippedTemplate): string[] {
  return listSuggestedOptionalNodes(template).map((n) => n.key)
}
