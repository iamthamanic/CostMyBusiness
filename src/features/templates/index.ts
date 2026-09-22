/**
 * Templates feature public API.
 * Location: src/features/templates/index.ts
 */
export {
  applyShippedTemplate,
  applyTemplateById,
  getLayerGuidance,
  isCustomTemplateId,
  resolveTemplateId,
  type ApplyTemplateOptions,
} from './application/apply-template'
export {
  defaultIncludedOptionalKeys,
  getShippedTemplate,
  listShippedTemplates,
  listSuggestedOptionalNodes,
} from './application/load-templates'
export { domainModelToTemplateDefinition } from './application/model-to-template'
export type { CustomTemplateRepository } from './application/custom-template-repository'
export {
  ShippedTemplateSchema,
  UnknownTemplateError,
  UnsupportedTemplateVersionError,
  type ShippedTemplate,
  type TemplateLayer,
  type TemplateNode,
} from './domain/template-schema'
export {
  CustomTemplateSchema,
  DuplicateTemplateNameError,
  type CustomTemplate,
} from './domain/custom-template'
export { TemplatePicker, type TemplatePickerValue } from './ui/TemplatePicker'
export { TemplatesPage } from './ui/TemplatesPage'
export { LayerGuidancePanel } from './ui/LayerGuidancePanel'
