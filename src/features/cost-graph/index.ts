/**
 * Cost-graph feature public API.
 * Location: src/features/cost-graph/index.ts
 */
export { buildProductModel } from './application/build-product-model'
export { mapDomainToFlow } from './application/map-domain-to-flow'
export { mapFunnelsToFlow, funnelFlowNodeId } from './application/funnel-graph-adapter'
export { composeFunnelsIntoModel } from './application/compose-funnels-into-model'
export { projectWorkbenchView } from './application/project-workbench-view'
export { applyProductPricingToModel } from './application/apply-product-pricing'
export { applyResolvedValuesToModel } from './application/apply-resolved-values'
export { layoutWithElk } from './application/layout-with-elk'
export { resolveViewType, type CostGraphViewType } from './application/view-node-type'
export {
  addCostNode,
  duplicateNode,
  removeNode,
  updateNodeEnabled,
  updateNodeInputs,
  updateNodeLabel,
} from './application/mutate-model'
export { CostGraphWorkbench } from './ui/CostGraphWorkbench'
export { ProductCalculatorWorkbench } from './ui/ProductCalculatorWorkbench'
