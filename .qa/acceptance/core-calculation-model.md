# Feature: 03 Core domain model and calculation engine

<!-- seeded by ecc-runner from issue #3 on 2026-09-22 — @implement may refine -->

## Intent
Domain-Graph (Nodes/Edges) und reiner Calculator liefern per-unit und Periodenergebnisse mit Provenance und unresolved statt NaN (FR-002, FR-005–007, FR-016, BR-001, BR-002).

## Happy Path
- [ ] - [ ] Domain node/edge types with stable IDs (not label-derived)
- [ ] - [ ] Deterministic evaluate + Vitest fixture for per-unit and period totals
- [ ] - [ ] Cycle and unresolved paths covered by tests
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
- Domain nodes/edges with stable IDs; evaluate() + CycleError; unresolved vs NaN
