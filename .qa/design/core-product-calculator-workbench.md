# Design: Core Product Calculator Workbench

**Slug:** `core-product-calculator-workbench`  
**Status:** Approved for this coding pass  
**Supersedes (UX):** React Flow as primary editor in prior corrective slices  
**Sources:** User brief 2026-09-22 evening, reference mock (Halteverbotszone Berlin), `visual-product-calculator-corrective.md`, PRD FR-008a…e / SCN-026…030

## Problem

The calculation DAG is still projected 1:1 into React Flow + ELK. That produces a workflow-editor look, auto-fitZoom miniaturization, and a stacked ProductDetailPage of unrelated panels. Funnel nodes are RF-only and do not feed totals. `profit` reuses contribution math incorrectly. `percentage_revenue` uses a baked `revenuePerUnit`.

## Decision: Presentation vs Calculation

```text
DomainModel  ──►  evaluate()          (calculation projection — keep)
             └──►  workbenchView()    (presentation projection — NEW)
                        │
                        ▼
                 CSS Grid Workbench (PRIMARY)
                 React Flow          (optional Expert view only)
```

| Layer | Owns |
|---|---|
| Calculation | edges, topo order, contribution/profit, formulas, allocation provenance |
| Presentation | department columns, compact/expand rows, product root, result spine, colors |

Calculation edges **must not** drive visual layout.

## Primary renderer

**CSS Grid / Flex workbench** is the desktop primary view.

React Flow remains in-repo behind **Optionen → Experten-Graph** for debugging / complex models — not the default.

## Layout (desktop)

1. Compact product header (scenario/period/options)
2. Product Root calculator (price, VAT, net)
3. Five department columns (Marketing → Overhead)
4. Result spine: Direct → Contribution → Allocated → Profit → Margin

Mobile: vertical department accordions + same spine.

Width: workbench shell up to ~1800px; horizontal scroll OK; no auto fit-all zoom.

## Funnel composition

```text
ProductFunnel → acquisitionCostPerOrder → DomainNode (cost under Marketing/Sales)
                                          → evaluate() totals
```

Reuse `calculateMarketingMetrics` / `calculateSalesMetrics`. No second CAC engine.

## Calc fixes in this pass

1. `profit` = contribution − allocated upstream costs (not `computeContribution`)
2. `percentage_revenue` reads live revenue node per-unit (ignore stale `revenuePerUnit` when revenue exists)
3. `formulaRef` evaluated via restricted AST when present
4. Margin shown on spine as profit / net revenue (presentation + optional result key)

## Non-goals

#16 compare, #18 remote persist expansion, #19 polish epic, new templates, AI, export, auth expansion.

## What stays

Pure core, pricing SoR, templates, funnel domain, scenarios domain, local repos, vertical slices.
