/**
 * Templates feature public API.
 * Location: src/features/templates/index.ts
 */
export {
  applyShippedTemplate,
  applyTemplateById,
  getLayerGuidance,
  resolveTemplateId,
  type ApplyTemplateOptions,
} from './application/apply-template'
export {
  defaultIncludedOptionalKeys,
  getShippedTemplate,
  listShippedTemplates,
  listSuggestedOptionalNodes,
} from './application/load-templates'
export {
  ShippedTemplateSchema,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
  type ShippedTemplate,
  type TemplateLayer,
  type TemplateNode,
} from './domain/template-schema'
export { TemplatePicker, type TemplatePickerValue } from './ui/TemplatePicker'
export { TemplatesPage } from './ui/TemplatesPage'
export { LayerGuidancePanel } from './ui/LayerGuidancePanel'
