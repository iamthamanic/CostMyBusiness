# Feature: 14 Sales funnels, funnel filter, break-even

## Intent

Sales-Funnels, Profitabilitätsfilter je Funnel und Break-even/Max-sustainable-cost (FR-012, FR-013, FR-015, SCN-010–012).

## Happy path

- [x] Sales funnel stages + sales acquisition cost calculated (SCN-010)
- [x] Funnel filter changes attributed profitability (SCN-011)
- [x] Break-even panel states formula and inputs (SCN-012)
- [x] Touched files: zero type escape hatches

## Edge cases

- [x] Filter with no attribution → German explanation
- [x] Break-even missing inputs → unresolved + missing field list

## Security Coverage

- F-02 Zod validation (SalesFunnelSchema + ProductFunnelSchema union)
- Out of scope: CRM sync, multi-touch ML
- Secure-by-Default: PASS (no Critical checklist hits; local adapter only)

## Implementation Notes

- `SalesFunnel` discriminated union with marketing; `createSales` + `salesCosts` / `marketingCosts` on update
- `calculateSalesMetrics` → sales CAC from won deals; `filterProfitabilityByFunnel` attributes CAC + contribution
- UI: SalesFunnelsPanel, FunnelFilterPanel, BreakEvenPanel on ProductDetail
- Tests: `tests/features/funnel-compare-breakeven.test.ts`; marketing update uses `marketingCosts`

## Composition Gate

Verdict: SKIPPED — see `.qa/runs/composition-gate-funnel-compare-breakeven.md`

## Verify

- `npm run checks`: PASS (lint warnings only pre-existing; typecheck/test/build/audit OK)
- typed-strict: no `any` / `@ts-expect-error` in touched funnel files

## Review

ACCEPT — Intent covered; German unresolved messages; architecture boundaries intact (core breakEvenUnits reused).

## ECC-Check

READY — verify PASS; composition SKIPPED; review ACCEPT; Secure-by-Default PASS.
