# Feature: 09 Cost node editing drivers enable disable duplicate remove

<!-- seeded by ecc-runner from issue #9 on 2026-09-22 — @implement may refine -->

## Intent
Owner konfiguriert Kostenpositionen inkl. Driver, Rename, Disable, Duplicate, Remove ohne Template-Mutation (FR-004, FR-005, SCN-003, SCN-004).

## Happy Path
- [ ] - [ ] Add/rename/disable/duplicate/remove optional cost nodes on product instance
- [ ] - [ ] Driver-based cost recalculates on input change in same interaction (SCN-004/013)
- [ ] - [ ] Every numeric input shows unit/basis (U-03)
- [ ] - [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge Cases
- [ ] (from .qa/edge-cases.md + @implement)

## Regression
- [ ] Feed and topic routes still load

## Assumptions
- none

## Screenshots
| Step | Filename |
|------|----------|
| 1 | `01-happy-path.png` |

## Implementation Notes
<!-- filled after coding -->

## Implementation Notes
- Pure mutate-model helpers; editable inspector; live evaluate on change
- Formula validate-on-save via parseFormula; optional cost add/duplicate/remove
