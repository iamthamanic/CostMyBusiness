# Feature: 01 Bootstrap Vite React TypeScript app shell

<!-- seeded by ecc-runner from issue #1 on 2026-09-22 — @implement may refine -->

## Intent
Das Repo bekommt eine lauffähige Vite+React+TypeScript-App mit Tailwind, path aliases und `npm run checks`, damit alle späteren Slices einen App-Root haben.

## Happy Path
- [ ] - [ ] Vite React TS app boots; German placeholder page at `/`
- [ ] - [ ] Tailwind + path alias `@/` → `src/` configured
- [ ] - [ ] `npm run checks` = lint + typecheck + vitest + build + `npm audit --audit-level=high`
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
- Vite + React + TypeScript strict app shell under `src/app/`
- Tailwind v4 via `@tailwindcss/vite`; path alias `@/` → `src/`
- German placeholder page; `npm run checks` = lint + typecheck + vitest + build + audit high+
- `.env.example` documents public Supabase vars only
- No type escape hatches
