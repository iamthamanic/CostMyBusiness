# Epic Design: V1 MVP Delivery

**Slug:** `v1-mvp-delivery`  
**Status:** Partially delivered (issues #1–#15/#17 merged). **Corrective epic supersedes remaining workbench UX assumptions.**  
**Sources:** `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `AGENTS.md`, `.qa/design/visual-product-calculator-corrective.md`

## Problem & Intent

CostMyBusiness V1 delivers a personal **visual product calculator**: from selling price through departments and concrete cost/funnel nodes to contribution, allocated overhead, profit, and margin — with a pure calculation core and German UI.

The original “inspector as main editing surface” workbench assumption is **withdrawn**. See corrective design.

## Non-Goals (deferred — no issues)

- Google Ads / Meta / Stripe / CRM / ERP / DATEV / bank integrations
- Multi-user company workspaces, comments, collaboration
- Template marketplace, AI suggestions, forecasting matrices
- Accounting ledger, tax filing, payroll, invoicing, native mobile app
- Dark mode, Next.js, Redux, microservices, custom Express API
- Manual free-form graph wiring as primary UX
- Industry forks inside `src/core/calculation`

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
| **Calculator UX** | **Cost Graph is primary editor; Inspector is secondary advanced surface** |
| **Pricing** | Product pricing SoR: sellingPrice, priceKind gross\|net, taxRate, pricingBasis, currency; VAT ≠ cost node |
| UI kit | Tailwind + **shadcn/ui** under `src/shared/ui/` (not DaisyUI/Next) |
| State | Zustand for editor session; React Hook Form + Zod for forms |
| Periods | Day/Week/Month/Quarter/Year; **Month** default; native basis retained (no naive divide) |
| Scenarios | Actual / Budget / Scenario; Scenario = base + **sparse overrides** |
| Templates | Schema-driven industry + **product-type** templates (e.g. Traffic Safety → Halteverbotszone); no industry forks in core |
| Locale | German UI; English code/commits |
| Auth | Supabase Auth only — no custom password stack |
| Hosting env | `.env.example` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` only |

## Options considered

1. **Big-bang rewrite of calculation + UI** — rejected (user: extend existing core)
2. **Continue #16/#18/#19 before UX correction** — rejected (wrong SoR for editing)
3. **Chosen:** corrective vertical slices (pricing → tree → inline nodes → template V2 → funnel-in-tree → E2E), then resume persistence/compare/polish

## Implementation order

### Completed (do not reopen)

Issues **#1–#15, #17** (bootstrap through funnels/scenarios/templates/auth as merged). Treat as foundation.

### Corrective queue (run next — `@ecc-runner-loop`)

Respect `Depends on #N` on each issue:

1. **#36** Product Pricing Root + Gross/Tax/Net Revenue  
2. **#37** Cost Tree Workbench Redesign / Department Clusters  
3. **#38** Inline Cost Calculator Nodes  
4. **#39** Traffic Safety / Halteverbotszone Template V2  
5. **#40** Funnel Nodes in Main Cost Tree  
6. **#41** Regression / E2E Core Product Calculation (SCN-030)

### Deferred until corrective E2E green (`needs-human`)

- **#16** Side-by-side scenario comparison UI (Depends on #41)  
- **#18** Persist full model / templates / scenarios (Depends on #36, #41)  
- **#19** V1 polish a11y / performance / security / CI (Depends on #41)  

## Runtime

Single runtime: Vite SPA (browser). No Tauri / hybrid axes.

## UI direction

Follow `DESIGN.md` / `docs/UI_STYLEGUIDE.md`: **visual product calculator**, Margin Spine, light ledger aesthetic, German copy, mobile hierarchy-first with inline primary inputs.
