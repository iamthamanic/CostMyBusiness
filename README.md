# CostMyBusiness

CostMyBusiness is a personal-first profitability modeling workbench for products and services. It visualizes how revenue flows through acquisition, sales, operations, support, product/technology and overhead, and it supports funnel-specific profitability, editable formulas, industry templates and Actual/Budget/Scenario comparisons.

## Documentation

- [PRD.md](PRD.md) - product requirements and implementation contract
- [ARCHITECTURE.md](ARCHITECTURE.md) - module boundaries, dependency rules and technical architecture
- [DESIGN.md](DESIGN.md) - UI/UX system, workbench behavior and design rules
- [AGENTS.md](AGENTS.md) - rules for coding agents working in this repository

## Planned stack

- TypeScript (strict)
- React
- Vite
- React Flow (`@xyflow/react`) with automatic layout
- Tailwind CSS + shadcn/ui primitives
- Zustand
- React Hook Form + Zod
- Recharts
- Supabase/Postgres/Auth/RLS for persistence
- Vitest + React Testing Library + Playwright

The repository is documentation-first at this stage. No product feature code has been bootstrapped yet.

## Architecture

CostMyBusiness uses a modular monolith with vertical feature slices and a pure shared TypeScript domain core. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Agent workflow

1. Read `AGENTS.md`.
2. Read `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md`.
3. Use `@pingpong-solution` for material design changes.
4. Implement one vertical user-value slice at a time.
5. Run deterministic checks and UI verification before shipping.

## License

Not defined yet.