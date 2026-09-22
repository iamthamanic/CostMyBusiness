# Feature: 40 Funnel Nodes in Main Cost Tree

## Intent
Surface marketing/sales funnels as specialized nodes under Marketing/Sales in the Cost Graph, reusing funnel metrics (FR-008e, SCN-029).

## Happy path
- [x] Funnel visible under Marketing in main tree
- [x] Metrics reuse existing funnel engine (no duplicate CAC math)
- [x] Inline/basic edits work without requiring side-only panel
- [x] Touched files: zero type escape hatches

## Edge Cases
- [x] Product with no funnels → no fake funnel nodes
- [x] Orphan / load error → German message

## Security Coverage
- F-02 / FE-03 via existing funnel schemas — PASS

## Composition Gate
- Verdict: SKIPPED
- Proof: `.qa/runs/composition-gate-funnel-nodes-in-cost-tree.md`
- Reason: Single-hop local CRUD + pure metric remap; no async fan-out

## Implementation Notes
- `mapFunnelsToFlow` RF-only adapter; SoR remains `funnels/` repos + metrics
- Wired via `CostGraphWorkbench` `productId` from ProductDetailPage
- Tests: `tests/features/funnel-nodes-in-cost-tree.test.ts`
- Verify: `npm run checks` PASS
- Review: ACCEPT
- ecc-check: READY
