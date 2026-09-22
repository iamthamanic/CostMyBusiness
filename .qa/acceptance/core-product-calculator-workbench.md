# Feature: Core Product Calculator Workbench

## Intent
Replace React-Flow-as-primary with a CSS-grid visual product calculator; fix profit, percentage_revenue, formulaRef, and funnel→calc composition so Halteverbotszone tells “89 € in → costs → profit/margin out”.

## Happy path
- [x] Product Root editable; net 74.79 for 89 gross / 19% VAT
- [x] Five department columns with cost rows inside containers
- [x] Compact Fahrer shows 28×0.30×2 → 16.80; expand+edit cascades totals
- [x] Result spine: direct → contribution → allocated → profit → margin (per order)
- [x] Product price change updates percentage_revenue costs
- [x] Funnel cost change updates Marketing + contribution/profit/margin
- [x] Inspector not required for happy path
- [x] No NaN / Infinity / silent unresolved 0
- [x] Touched files: zero type escape hatches

## Edge Cases
- [x] Unresolved cost shows German message, not 0
- [x] Mobile: accordion departments + spine
- [x] Expert graph optional only (not default)

## Security Coverage
- FE-01: formulaRef via AST only — PASS
- FE-03: unresolved never silent finite fake — PASS
- F-02: Zod/product inputs remain validated — PASS

## Composition Gate
- Verdict: SKIPPED
- Proof: `.qa/runs/composition-gate-core-product-calculator-workbench.md`

## Implementation Notes
- Primary: `ProductCalculatorWorkbench` (CSS grid)
- Calc: profit ≠ contribution; live revenue for % costs; formulaRef AST; `composeFunnelsIntoModel`
- ProductDetailPage decluttered; wide shell to 1800px
- Evidence: `.qa/evidence/core-product-calculator-workbench/` + SCN-030 e2e
- Verify: `npm run checks` + `npm run test:e2e` (chromium SCN-030)
