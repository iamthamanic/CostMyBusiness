# Feature: 04 Restricted formula engine AST parse and evaluate

<!-- seeded by ecc-runner from issue #4 on 2026-09-22 — @implement may refine -->

## Intent
Sichere Formelsprache zum Anzeigen/Editieren von Defaults ohne JavaScript-Execution (FR-023–025, FR-024, FE-01).

## Happy Path
- [ ] - [ ] Parse→AST→evaluate for allowed ops/functions with Vitest matrix
- [ ] - [ ] Security tests prove eval/new Function paths absent and unsafe strings rejected
- [ ] - [ ] Reset-to-default supported at data level (`source: default|custom`)
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
- Restricted AST parser/evaluator; rejects unsafe syntax; resetToDefault; no eval/new Function
