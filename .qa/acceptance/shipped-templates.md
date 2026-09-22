# Feature: 11 Shipped industry templates including Traffic Safety

## Intent

Versionierte Branchen-Templates erzeugen den Produktgraphen inkl. Traffic Safety Operations-Vorschlägen (FR-019, FR-020, FR-022, SCN-015, SCN-017).

## Happy path

- [ ] Five shipped templates (SaaS, E-commerce, Service, Traffic Safety, Custom) apply and generate a connected, calculable graph without manual wiring
- [ ] Creating a product with Traffic Safety preselects ops suggestions; owner can deselect before create
- [ ] Layer guidance shows general + industry-specific copy when available (Operations)
- [ ] Product create flow includes German template picker
- [ ] Removing a suggested node from the product instance does not mutate shipped JSON (BR-004)
- [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge cases

- [ ] Unknown template id or unsupported version → explicit German error, no silent fallback to wrong graph
- [ ] Deselecting all optional ops still leaves required revenue + contribution structure
- [ ] Custom template applies minimal blank-ready graph

## Regression

- [ ] Existing product open without templateId still builds a calculable graph
- [ ] Local product create/list/delete still works
- [ ] `npm run checks` green

## Security Coverage

- F-02: Template JSON validated with Zod before use; labels rendered as text only
- Out of scope: auth/RLS (later), custom template persistence (#12)

## Assumptions

- Product stores `templateId` + optional inclusion keys; full model persistence is later (#18)
- No marketplace; shipped templates only

## Screenshots

| Step | Filename |
|------|----------|
| 1 | `01-template-picker.png` |

## Implementation Notes

- Shipped Zod-validated templates under `src/data/default-templates/` (saas, ecommerce, service, traffic-safety, custom)
- `src/features/templates/**`: load/apply, TemplatePicker with optional deselect, TemplatesPage, LayerGuidancePanel
- Product stores `templateId` / `templateVersion` / `includedOptionalKeys`; workbench builds model via `applyTemplateById`
- Inspector shows FR-022 guidance for Operations/Acquisition group nodes
- Tests: `tests/features/shipped-templates.test.ts` + updated cost-graph/editing tests for key-based node ids
- Composition-gate: SKIPPED (single-hop, no side-effect hops) — see `.qa/composition-gate/shipped-templates.md`