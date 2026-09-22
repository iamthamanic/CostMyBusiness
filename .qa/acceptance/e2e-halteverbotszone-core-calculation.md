# Feature: 41 E2E Halteverbotszone Core Calculation (SCN-030)

## Intent
Automate SCN-030: product create, gross/tax/net, department clusters, inline Fahrer edit, cascaded totals without Inspector.

## Happy path
- [x] E2E covers SCN-030 happy path including inline edit cascade
- [x] Asserts Inspector not required for normal flow
- [x] Asserts unresolved never silent 0/NaN/Infinity in the flow
- [x] Touched files: zero type escape hatches

## Edge Cases
- [x] Mobile hierarchy path smoke (Pixel 5 project)
- [x] Net 74.79 shown per-unit on graph; KPI remains period total

## Security Coverage
- No secrets in fixtures — PASS
- Playwright upgraded past GHSA-7mvr-c777-76hp (high) — PASS

## Composition Gate
- Verdict: SKIPPED
- Proof: `.qa/runs/composition-gate-e2e-halteverbotszone-core-calculation.md`

## Implementation Notes
- Bootstrap: `playwright.config.ts`, `@playwright/test`, `npm run test:e2e`
- Specs: `e2e/scn-030-halteverbotszone-core.spec.ts`, `e2e/smoke.app-loads.spec.ts`
- Verify: `npm run checks` PASS + `npm run test:e2e` PASS (4 passed, 2 skipped)
- Review: ACCEPT
- ecc-check: READY
