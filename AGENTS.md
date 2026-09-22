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

## Validation

- **Checks:** `npm run checks` (lint + typecheck + unit tests + build + `npm audit --audit-level=high` once `package.json` exists)
- **Dev:** `npm run dev` → http://localhost:5173
- **E2E:** `npm run test:e2e` (Playwright via `@verify-ui` when ready)

Run checks before push. Do not bypass hooks.

## Issue Template (verbindlich)

Alle Issues folgen dem kanonischen Template aus **`@issue-contract`**
(global: `~/.claude/skills/issue-contract/references/issue-template.md`).
Projekt-Override (nur bei Bedarf): `.qa/issue-template.md`.
Projekt-Werte: `.qa/project.yaml` → `issueContract`.

Pflicht-Sektionen in Reihenfolge: `Type → Intent → Goal → Non-Goals → Context → Scope → User Journey → Runtime → Security & Data → Edge Cases → Acceptance → Blockers → Runner`.

## Security Checklist (Secure by Default)

Diese Checkliste ist für alle Agents verbindlich. Jede Feature-Implementierung muss die zutreffenden Sektionen abhaken. `@implement` dokumentiert Coverage in der Acceptance-Datei; `@audit-changes` / `@ecc-check` führen diff-scoped Probes aus; hop-chains zusätzlich über `@composition-gate` (FLAGGED muss gefixt werden).

### Frontend Security

| # | Maßnahme | Fail if |
|---|----------|---------|
| F-01 | HTTPS überall | App läuft ohne TLS oder mixed content |
| F-02 | Input-Validierung & Sanitization | Unvalidierter User-Input erreicht Render-/State-Schicht |
| F-03 | Keine sensiblen Daten im Browser | `localStorage.setItem('token'\|'secret'\|'password', …)` im Diff |
| F-04 | CSRF-Schutz | State-changing Request ohne CSRF-Token oder SameSite-Cookie |
| F-05 | API-Keys nie im Frontend | Secrets in Client-Bundle, privileged keys in `VITE_*` |

### Backend Security

| # | Maßnahme | Fail if |
|---|----------|---------|
| B-01 | Authentication Fundamentals | Eigenbau-Auth, Plaintext- oder schwache/unsalted Hashes |
| B-02 | Authorization Checks | Sensitive Operation ohne Owner-/Workspace-Check |
| B-03 | API-Endpoint-Schutz | Unauthentifizierter Zugriff auf geschützte Ressource |
| B-04 | SQL-Injection-Prävention | String-Konkatenation in SQL mit User-Input |
| B-05 | Basis Security Headers | Headers fehlen oder `unsafe-inline`/`unsafe-eval` ohne Removal-Plan |
| B-06 | DDoS-Schutz | Rate-Limiting deaktiviert, kein Edge-Protection-Layer |
| B-07 | Least-privilege assignment | Actor kann mehr vergeben als er hält |
| B-08 | Deny-by-default AuthZ map | Unbekannter Pfad → Default-Allow statt deny |
| B-09 | Trust-boundary identity | User-ID/Rollen aus Client-Headern als AuthZ-Beweis |
| B-10 | Secrets fail-closed | `process.env.SECRET \|\| 'default-…'` |

### Practical Security Habits

| # | Maßnahme | Fail if |
|---|----------|---------|
| P-01 | Dependencies aktuell | `npm audit --audit-level=high` zeigt offene High/Critical |
| P-02 | Korrekte Fehlerbehandlung | Error-Response enthält Stack-Trace, Secrets, Finanzwerte oder Formeln |
| P-03 | Secure Cookies | Session-Cookie ohne HttpOnly oder ohne Secure in Prod |
| P-04 | File-Upload-Sicherheit | Upload ohne Type/Size-Validierung (V1: keine Uploads) |
| P-05 | Rate Limiting | Auth-Endpoint ohne Rate-Limit |
| P-06 | Side-effect jobs / Outbox | N identische externe Sends; nicht-atomarer Worker-Claim |

### Formula engine (project-specific)

| # | Maßnahme | Fail if |
|---|----------|---------|
| FE-01 | Restricted AST only | `eval` / `new Function` / JS execution of user formula |
| FE-02 | Cycle detection | Cyclic formula/graph dependency is saved or loops |
| FE-03 | Unresolved results | Infinity/NaN shown as a normal number |
| FE-04 | No secret leakage | Formula text or financial values logged to analytics by default |

Critical-Verstöße (F-03, B-01, B-04, B-07, B-08, B-09, B-10, P-04, FE-01) blocken PR/READY.

## QA pipeline

```text
@pingpong-solution -> @implement -> @verify-ticket -> @composition-gate -> @verify-ui -> @review-ticket -> @ecc-check
```

- Design artifacts: `.qa/design/`
- Acceptance: `.qa/acceptance/` (auto-generated by `@implement`)
- Project config: `.qa/project.yaml`
- Issue template: `@issue-contract`
- Living docs: `@memory-live-doc`
- Composition: `@composition-gate` — hop-chain meaning. **FLAGGED findings must be fixed** before review ACCEPT / ecc-check READY / PR.

## Implementation order

Follow the PRD vertical slices unless a later approved design supersedes them. **Workbench UX is superseded by** `.qa/design/visual-product-calculator-corrective.md` (Cost Graph = primary editor).

Historical foundation (largely shipped):

1. Core model + calculation + periods/money.
2. Safe formula engine.
3. Product workbench and graph mapper (now under corrective redesign).
4. Templates + glossary/guidance.
5. Funnels.
6. Actual/Budget/Scenario.
7. Persistence/auth.
8. Performance/accessibility/security polish.

**Next coding queue:** Core Product Calculator Workbench is the sole priority until DoD (see `.qa/design/core-product-calculator-workbench.md`). Do **not** pick #16 / #18 / #19 or other side features until the workbench sits.

Locked delivery decisions for the coding queue (see `.qa/design/v1-mvp-delivery.md`):

- Host: **Vercel** static SPA (Q-001).
- Persistence: **local adapter first**, Supabase Auth/Postgres/RLS before V1 release (Q-002).
- Money: **`decimal.js`**, HALF_UP, currency ISO 4217 default **EUR**.
- Templates/glossary: versioned in repo under `src/data/**` (A-003).
- **UX:** Cost Graph is the primary calculator and editing surface; Inspector is secondary.

## Development Workflow

### Context compact & long queues (mandatory)

Auto-compact is **unreliable** (often mid-ticket, drops paths/partial state). Do **not** wait for the window to hard-fail.

**After every shipped issue** in a multi-ticket loop (`@ecc-runner-loop` or any N>1 queue):

1. Update the handoff file with: last merged issue/PR/SHA, next issue number + title. Set `paused: false` only if continuing immediately after compact in the same chat.
2. **Stop the turn** and tell the user to run `/compact` (or open a fresh chat and continue with the handoff). Prefer `@strategic-compact`. Do **not** claim the next issue in the same turn.
3. Resume the next ticket only **after** the user continues post-compact (or in the new chat with handoff loaded).

**Never compact mid-implementation** of the current issue (verify → PR → merge must stay in one context).

**Never** treat leftover CI poll / babysit timeouts as blockers; only open PRs and current default-branch HEAD matter.

## Living documentation

After material changes, run `@memory-live-doc` (or rely on `@implement` / `@ecc-check` / `@commit-push-safe` / `@project-setup` integration).

- Do not invent features in docs without evidence.
- Storage: `.project-memory/` (bilingual DE+EN JSON; human docs under `docs/` + `docs/en/`).
- Interactive viewer: `docs/memory-live-doc/` (local `/memory-live-doc/`; GitHub Pages/Sites opt-in only).
- Open locally: `@memory-live-doc serve` → `http://127.0.0.1:8765/memory-live-doc/`.
- First setup: `@project-setup` Step 9 or `@memory-live-doc bootstrap`.

## Done means

- Acceptance criteria have evidence.
- Core calculations have deterministic tests.
- UI changes have desktop/mobile verification.
- Architecture boundaries remain intact.
- No critical security findings.
- Relevant documentation is updated.
- `@composition-gate` is CLEAR or SKIPPED for the shipped HEAD.