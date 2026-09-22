# Feature: 06 Workspace business product ports and local adapter

<!-- seeded by ecc-runner from issue #6 on 2026-09-22 — @implement may refine -->

## Intent
Repository-Ports und Local-Adapter speichern Workspace/Business/Product/Model lokal, damit UI und spätere Supabase-Adapter dieselbe Contract-API nutzen (FR-001, Q-002).

## Happy Path
- [ ] - [ ] Ports: create/list/get/update/delete Business & Product; Product.currency defaults EUR
- [ ] - [ ] Local adapter round-trips fixture; Zod rejects invalid payloads
- [ ] - [ ] Feature public API only via `index.ts`
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
- Zod-validated cmb.v1 local snapshot; Business/Product ports; createLocalRepositories
- Corrupt store fails closed with German message; getInBusiness enforces scope
