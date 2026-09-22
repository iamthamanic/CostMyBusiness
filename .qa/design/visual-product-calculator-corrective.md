# Epic Design: Visual Product Calculator Corrective

**Slug:** `visual-product-calculator-corrective`  
**Status:** Approved for corrective issue creation (docs pass; implementation deferred to issues)  
**Sources:** User corrective brief 2026-09-22, `PRD.md` (FR-008a…e, SCN-026…030), `ARCHITECTURE.md`, `DESIGN.md`, repo inspection of `src/core/**`, `src/features/cost-graph/**`, `src/features/funnels/**`, `src/data/default-templates/traffic-safety.v1.json`

## Problem & Intent

The shipped workbench treats the graph as an explanatory Margin Spine and the **Inspector as the main editor** (`MarginNode` display-only; inputs in `InspectorPanel`). That contradicts the product: CostMyBusiness is a **visual product calculator** where everyday cost inputs are edited **on the node**, departments are clusters (not costs), product pricing includes gross/tax/net, and funnels live in the main cost tree.

## What stays (do not rewrite)

- Pure TS calculation engine (`src/core/calculation/**`)
- Money / periods / formula AST / metrics / allocation provenance
- Actual/Budget/Scenario sparse overrides (`src/features/scenarios/**`)
- Template validation + apply pipeline (`src/features/templates/**`)
- Funnel domain + marketing/sales metrics (`src/features/funnels/**`)
- React Flow + ELK mapper boundary (extend, do not abandon)
- Supabase Auth/RLS work already merged
- Vertical-slice modular monolith + strict TypeScript

## What must be refactored / extended

| Area | Today | Target |
|---|---|---|
| `Product.price` only | Scalar price | Pricing SoR: sellingPrice, priceKind, taxRate, pricingBasis, currency; migrate existing |
| Tax | N/A / easy to misuse as cost | Gross→net normalization; tax never a cost node |
| `MarginNode` | Single display node | View types: productPrice, revenue, department, costCalculator, funnel, result |
| Editing | Inspector primary | Inline schema-driven inputs on cost/funnel nodes; Inspector secondary |
| Departments | Thin group labels | Cluster subtotals with visible concrete children |
| `traffic-safety.v1.json` | Generic industry | Product-type template (Halteverbotszone) with full department tree defaults |
| Funnels | Side panel only | Also specialized nodes under Marketing in the tree |
| ELK sizes | Small card heights | Measured/expanded sizes so many calculators visible |
| Results | Partial KPI | Direct vs allocated spine + Contribution / Fully Loaded toggle |

## Non-Goals

- Rewrite calculation engine
- New state library / microservices / Next.js
- Hardcoded Halteverbot123 logic in `core/`
- Blindly continuing #16/#18/#19 before corrective slices land

## Corrective implementation order

1. **#36** Product Pricing Root + Gross/Tax/Net Revenue  
2. **#37** Cost Tree Workbench Redesign / Department Clusters (`Depends on #36`)  
3. **#38** Inline Cost Calculator Nodes (`Depends on #37`)  
4. **#39** Traffic Safety / Halteverbotszone Template V2 (`Depends on #37`, `#38`)  
5. **#40** Funnel Nodes in Main Cost Tree (`Depends on #38`)  
6. **#41** Regression / E2E Core Product Calculation (`Depends on #36`–`#40`)

## Relation to prior queue

| Issue | Action |
|---|---|
| #1–#15, #17 (merged) | Keep; do not rewrite history |
| #12 custom templates, #14 sales/filter/break-even (merged) | Keep; later adapt UI to tree where needed |
| **#16** scenario compare | `needs-human` until **#41**; Depends on #41 |
| **#18** persistence | `needs-human` until pricing+#41; Depends on #36, #41 |
| **#19** polish | `needs-human` until **#41**; Depends on #41 |

## UI direction

Follow updated `DESIGN.md`: graph-first calculator; Inspector secondary; German UI; light ledger aesthetic.
