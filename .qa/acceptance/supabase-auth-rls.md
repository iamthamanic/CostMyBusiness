# Feature: 17 Supabase Auth schema RLS and remote repository

## Intent

Supabase Auth + versionierte Migrations + RLS ersetzen Local-only für Owner-Daten (FR-031, A-001, D-005).

## Happy path

- [ ] Migrations + RLS policies; SQL/policy tests prove cross-user deny
- [ ] Sign-in/up/out German UI; no service role in client
- [ ] Remote adapter implements businesses/products ports; used when session present
- [ ] Touched files: zero type escape hatches (typed-strict / Boy Scout)

## Edge Cases

- [ ] Missing env → stay on local repos with German notice
- [ ] Expired session on save → keep local edits + re-auth prompt

## Security Coverage

- B-01 Managed Auth only
- B-02 / B-08 / B-09 RLS deny-by-default owner policies
- F-03 / F-05 No service role in client; anon key only
- Out of scope: multi-member workspaces, offline CRDT

## Implementation Notes

<!-- filled after coding -->

## Implementation Notes
- Migration with owner RLS on workspaces/businesses/products/models/funnels/scenarios/custom_templates/period_values
- AuthProvider + German AuthPage; remote businesses/products when session; anon-only client
- Vitest: cross-user deny helpers + migration asserts no service_role
