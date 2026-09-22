# CostMyBusiness

CostMyBusiness is a personal-first profitability modeling workbench for products and services. It visualizes how revenue flows through acquisition, sales, operations, support, product/technology and overhead, and it supports funnel-specific profitability, editable formulas, industry templates and Actual/Budget/Scenario comparisons.

## Documentation

- [PRD.md](PRD.md) — product requirements and implementation contract
- [ARCHITECTURE.md](ARCHITECTURE.md) — module boundaries, dependency rules and technical architecture
- [DESIGN.md](DESIGN.md) — UI/UX system, workbench behavior and design rules (normative styleguide)
- [docs/UI_STYLEGUIDE.md](docs/UI_STYLEGUIDE.md) — styleguide index for agents / `@verify-ui`
- [AGENTS.md](AGENTS.md) — rules for coding agents working in this repository

## Planned stack

- TypeScript (strict)
- React + Vite
- React Flow (`@xyflow/react`) + ELK.js automatic layout
- Tailwind CSS + shadcn/ui primitives
- Zustand
- React Hook Form + Zod
- Recharts
- Supabase / Postgres / Auth / RLS for persistence (after local adapter)
- Vitest + React Testing Library + Playwright

## Prerequisites

- Node.js 20+ and npm
- GitHub CLI (`gh`) for agent issue workflows
- Supabase project (only when implementing persistence / auth slices)

## Install / Dev

```bash
npm install
npm run dev
```

Dev URL: http://localhost:5173

## Checks

```bash
npm run checks
npm run test:e2e   # Playwright — add via @verify-ui when UI exists
```

`checks` must include lint, strict typecheck, unit tests, production build, and `npm audit --audit-level=high` once the app is bootstrapped.

## Environment

Copy `.env.example` when it exists. Never commit secrets.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Public Supabase URL (persistence slices) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key only — never service role |

## Project structure (target)

```text
src/
  app/                 # composition, routing, providers
  core/                # pure TS domain (no React/Supabase)
  features/            # vertical slices
  shared/
  integrations/
  data/                # shipped templates + glossary
supabase/migrations/
tests/
.qa/
```

## Architecture

Modular monolith with vertical feature slices and a pure shared TypeScript domain core. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Agent workflow

1. Read `AGENTS.md`.
2. Read `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md`.
3. Use `@pingpong-solution` for material design changes.
4. Implement one vertical user-value slice at a time.
5. Pipeline: `@verify-ticket` → `@composition-gate` → `@verify-ui` → `@review-ticket` → `@ecc-check`.

## License

Not defined yet.
