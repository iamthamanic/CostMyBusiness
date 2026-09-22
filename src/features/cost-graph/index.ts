/**
 * Cost-graph feature public API.
 * Location: src/features/cost-graph/index.ts
 */
export { buildProductModel } from './application/build-product-model'
export { mapDomainToFlow } from './application/map-domain-to-flow'
export { layoutWithElk } from './application/layout-with-elk'
export { resolveViewType, type CostGraphViewType } from './application/view-node-type'
export {
  addCostNode,
  duplicateNode,
  removeNode,
  updateNodeInputs,
  updateNodeLabel,
} from './application/mutate-model'
export { CostGraphWorkbench } from './ui/CostGraphWorkbench'
