# Feature: 12 Save owner custom templates

## Intent

Owner speichert angepasste Modelle als wiederverwendbare Custom Templates ohne Shipped-Templates zu ändern (FR-021, SCN-016).

## Happy path

- [ ] Save as template creates owner custom template; shipped templates unchanged
- [ ] New product can be created from that custom template
- [ ] Templates page lists shipped vs custom separately
- [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge cases

- [ ] Save fails → German save-failed; product edits retained
- [ ] Name collision → ask rename, do not overwrite silently

## Security Coverage

- F-02: Zod-validate custom template payloads
- Owner-scoped via workspaceId on local adapter
- Out of scope: marketplace, Supabase remote custom templates (#18)

## Implementation Notes

<!-- filled after coding -->

## Implementation Notes
- CustomTemplate in local snapshot; saveFromModel copies DomainModel → definition
- Templates page: shipped vs custom; ProductDetail „Als Vorlage speichern“; picker includes custom
- Duplicate name rejected; shipped JSON never mutated
