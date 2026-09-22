# Feature: 10 Glossary data and contextual help UI

<!-- seeded by ecc-runner from issue #10 on 2026-09-22 — @implement may refine -->

## Intent
Kontextuelle Glossar-Hilfe erklärt Domänenbegriffe inkl. Formel und Beispiel (FR-017, FR-018, FR-022 partial, SCN-014).

## Happy Path
- [ ] - [ ] Glossary records include id, term, fullName, shortDefinition, definition, formulaDescription?, example?, category, related
- [ ] - [ ] Contextual help works mouse + keyboard + tap
- [ ] - [ ] Glossary route lists shipped terms in German UI
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
- Shipped terms.json; GlossaryHelp keyboard/tap; Glossary page route
