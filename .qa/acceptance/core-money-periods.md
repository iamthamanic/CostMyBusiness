# Feature: 02 Core money and period normalization

<!-- seeded by ecc-runner from issue #2 on 2026-09-22 — @implement may refine -->

## Intent
Reine Domain-Module für Geld und Perioden, damit alle Berechnungen decimal-sicher und period-korrekt sind (FR-029, FR-030, BR-003).

## Happy Path
- [ ] - [ ] `Money`/`DecimalValue` API hides floats; uses decimal.js; EUR default
- [ ] - [ ] Period types Day|Week|Month|Quarter|Year; Month default helper
- [ ] - [ ] Vitest covers rounding, mismatch, and at least one native-basis conversion
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
- `Money` + `decimal.js` with EUR default, HALF_UP display 2dp, CurrencyMismatchError
- Periods Day…Year, Month default; normalizeToPeriod refuses naive hourly/order without params
