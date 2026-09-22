# AGENTS.md - CostMyBusiness

This document is the binding project map for humans and coding agents. Read it before changing code.

## Project

CostMyBusiness is a personal-first business profitability modeling application. It models product revenue, funnels, cost drivers, allocations, operations and overhead as a traceable calculation graph and supports industry templates plus Actual/Budget/Scenario planning.

- PRD: [PRD.md](PRD.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- UI/UX: [DESIGN.md](DESIGN.md)

## What this repository is

- A TypeScript/React web application.
- A modular monolith organized by vertical feature slices.
- A financial/business modeling tool with a pure calculation core.

## What this repository is not

- An accounting ledger or tax product.
- A general-purpose workflow builder.
- A microservice system.
- A place for executable user formulas.

## Planned tech stack

| Area | Technology |
|---|---|
| Language | TypeScript strict |
| Frontend | React + Vite |
| Graph | React Flow with automatic layout |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Client state | Zustand |
| Validation | Zod + React Hook Form |
| Charts | Recharts |
| Persistence | Supabase/Postgres/Auth/RLS |
| Tests | Vitest + React Testing Library + Playwright |

Do not add Next.js, Redux, microservices, or a separate Express API without an approved architecture decision.

## Architecture rules

1. Organize product work by vertical feature slice.
2. `src/core/**` must be pure TypeScript and must not import React, Supabase, React Flow, browser APIs, or feature modules.
3. React Flow is a visualization adapter. Its node/edge objects are not persisted business truth.
4. Industry behavior belongs in templates/configuration unless it represents a genuinely universal domain concept.
5. Actual/Budget/Scenario and period semantics are domain concepts, not UI-only state.
6. Preserve direct-vs-allocated cost provenance in results.
7. User formulas are parsed expressions. Never use `eval`, `new Function`, or arbitrary executable code.
8. Feature slices expose public APIs through `index.ts`; do not deep-import another feature's internals.
9. Add shared abstractions only when there is a real second consumer.
10. Keep persistence behind repository/adaptor contracts.

## Language and naming

| Area | Language |
|---|---|
| Default UI | German |
| Code identifiers | English |
| Commits | English |
| Technical docs | English unless a task requires German |

Stable IDs must never depend on translated labels.

## UI rules

- `DESIGN.md` is normative.
- Desktop: graph workbench + inspector.
- Mobile: hierarchy/list first; do not force a mini desktop canvas.
- Every essential business acronym/term uses central glossary help.
- Every input shows its unit/basis.
- Derived and editable values must be visually distinct.
- Required states: loading, empty, invalid, unsaved, saving, save-failed, disabled, focus and selected where applicable.
- Target WCAG 2.2 AA.

## Security checklist

### Frontend

- No secrets or privileged API keys in client bundles.
- Validate user input before persistence/domain boundary use.
- Render user labels as text, not raw HTML.
- No auth/session secrets in localStorage.
- State-changing authenticated requests must use the security properties of the chosen auth architecture.

### Backend/persistence

- Do not build custom authentication primitives when managed auth is available.
- Enforce owner/workspace authorization at the database/server boundary.
- Supabase user-owned tables require RLS.
- Use parameterized/SDK queries; no raw SQL string concatenation with user input.
- Unknown/unauthorized resources deny by default.
- Never trust client-supplied identity fields as authorization proof.

### Formula engine

- Formula text is hostile input.
- Parse to an AST and validate symbols/functions.
- No JavaScript execution.
- Detect dependency cycles.
- Handle divide-by-zero, unknown symbols, missing dependencies and invalid results explicitly.

### Practical security

- No secrets in logs/errors.
- Dependency audit in CI before release.
- Secure cookies/session defaults in production.
- Do not log financial values or formula contents to product analytics by default.

Critical security violations block acceptance.

## QA pipeline

```text
@pingpong-solution -> @implement -> @verify-ticket -> @verify-ui -> @review-ticket -> @ecc-check
```

Project QA paths:

- `.qa/project.yaml`
- `.qa/design/`
- `.qa/acceptance/`
- `.qa/edge-cases.md`

## Implementation order

Follow the PRD vertical slices unless a later approved design supersedes them:

1. Core model + calculation + periods/money.
2. Safe formula engine.
3. Product workbench and graph mapper.
4. Templates + glossary/guidance.
5. Funnels.
6. Actual/Budget/Scenario.
7. Persistence/auth.
8. Performance/accessibility/security polish.

## Done means

- Acceptance criteria have evidence.
- Core calculations have deterministic tests.
- UI changes have desktop/mobile verification.
- Architecture boundaries remain intact.
- No critical security findings.
- Relevant documentation is updated.