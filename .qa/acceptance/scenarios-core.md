# Feature: 15 Actual Budget Scenario contexts with sparse overrides

## Intent

Actual/Budget/Scenario als Domain-Kontexte mit Sparse Overrides und Periodenwahl (FR-026–027, FR-029–030, SCN-020–021, SCN-023).

## Happy path

- [ ] Actual/Budget/Scenario switch leaves other contexts intact (SCN-020)
- [ ] Scenario stores sparse overrides only; remove override restores inherit (SCN-021)
- [ ] Period Day…Year with Month default; Vitest for normalization reuse
- [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge cases

- [ ] Orphan override flagged and excluded from resolution (BR-005)
- [ ] Scenario inheritance cycle rejected
- [ ] Period switch uses `normalizeToPeriod` (not naive /12)

## Regression

- [ ] Product workbench + funnels still load
- [ ] `npm run checks` green

## Security Coverage

- F-02: Zod validate planning state; no secrets
- Out of scope: side-by-side compare (#16), forecast engine

## Implementation Notes

<!-- filled after coding -->

## Implementation Notes
- `src/features/scenarios/**`: resolveContext (sparse overrides, orphans, cycles), PlanningRepository, ContextPeriodChrome
- Local snapshot `planning[]`; Month default period; normalizePlanningQuantity wraps core periods
- Product detail hosts context/period chrome above workbench
