# Feature: 05 Core metrics registry and allocation provenance

<!-- seeded by ecc-runner from issue #5 on 2026-09-22 — @implement may refine -->

## Intent
Universelle Metrik-IDs und Allokationsstrategien halten Direct vs Allocated getrennt (FR-006, BR-006, FR-015 Should prep).

## Happy Path
- [ ] - [ ] Stable metric IDs for revenue, CTR, CPC, CVR, CPA, CAC, contribution, margins, fullyLoadedProfit, breakEvenUnits
- [ ] - [ ] Allocation result includes source pool + rule; Vitest proves direct≠allocated collapse
- [ ] - [ ] Break-even helper returns formula inputs when valid else Unresolved
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
- Metric registry + allocate() with provenance; breakEvenUnits; combineDirectAndAllocated
