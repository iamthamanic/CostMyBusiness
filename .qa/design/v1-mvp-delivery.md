# Epic Design: V1 MVP Delivery

**Slug:** `v1-mvp-delivery`  
**Status:** Approved for issue creation (project-setup + user request for `@ecc-runner-loop`)  
**Sources:** `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `AGENTS.md`

## Problem & Intent

CostMyBusiness is documentation-only. V1 must deliver a personal profitability workbench covering PRD Must requirements (FR-001…FR-032 where Must) via vertical slices, with a pure calculation core and German UI.

## Non-Goals (deferred — no issues)

- Google Ads / Meta / Stripe / CRM / ERP / DATEV / bank integrations
- Multi-user company workspaces, comments, collaboration
- Template marketplace, AI suggestions, forecasting matrices
- Accounting ledger, tax, payroll, invoicing, native mobile app
- Dark mode, Next.js, Redux, microservices, custom Express API
- Manual free-form graph wiring as primary UX

## Locked decisions (coding agents must not re-decide)

| ID | Decision |
|---|---|
| Q-001 | Deploy static SPA on **Vercel** |
| Q-002 | **Local repository adapter first**; Supabase Auth + Postgres + RLS before V1 release |
| A-001 | Authenticated owner-scoped persistence for V1 |
| A-002 | Default currency **EUR** (ISO 4217 field always present) |
| A-003 | Shipped templates + glossary versioned under `src/data/**` |
| Money | Library **`decimal.js`**; display round HALF_UP to **2** dp; internal calc precision ≥ 8; never leak IEEE float into money APIs |
| Formula | Restricted AST only: `+ - * / % () SUM AVG MIN MAX ROUND IF` — no `eval` / `new Function` |
| Graph | Domain model is SoR; React Flow (`@xyflow/react`) + **elkjs** layout via mapper only |
| UI kit | Tailwind + **shadcn/ui** under `src/shared/ui/` (not DaisyUI/Next) |
| State | Zustand for editor session; React Hook Form + Zod for forms |
| Periods | Day/Week/Month/Quarter/Year; **Month** default; native basis retained (no naive divide) |
| Scenarios | Actual / Budget / Scenario; Scenario = base + **sparse overrides** |
| Templates | SaaS, E-commerce, Service, Traffic Safety, Custom — schema-driven, no industry forks in core |
| Locale | German UI; English code/commits |
| Auth | Supabase Auth only — no custom password stack |
| Hosting env | `.env.example` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` only |

## Options considered

1. **Big-bang app + all features** — rejected (unverifiable PRs)
2. **YAGNI / defer persistence forever** — rejected (FR-031 Must)
3. **Chosen:** local-first vertical slices → Supabase → polish (PRD VS-01…VS-08)

## Implementation order

Issues are ordered 01→19. Queue runners must respect `Depends on #N`. Do not skip ahead.

## Runtime

Single runtime: Vite SPA (browser). No Tauri / hybrid axes.

## UI direction

Follow `DESIGN.md` / `docs/UI_STYLEGUIDE.md`: Margin Spine workbench, light ledger aesthetic, German copy, mobile list-first.
