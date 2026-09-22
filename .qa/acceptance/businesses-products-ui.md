# Feature: 07 Businesses and products German CRUD UI

<!-- seeded by ecc-runner from issue #7 on 2026-09-22 — @implement may refine -->

## Intent
Nutzer legen Businesses und Produkte auf Deutsch an und öffnen sie (FR-001, J-001 partial).

## Happy Path
- [ ] - [ ] User can create ≥2 businesses and multiple products scoped correctly (SCN-001)
- [ ] - [ ] Required UI states for list/create forms; units/currency shown on price fields
- [ ] - [ ] Desktop 1280 and mobile 390 layouts usable without canvas
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
- React Router + German CRUD for businesses/products via local repos
- Empty/loading/error/saved states; currency unit hints; delete confirm
