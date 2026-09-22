# UI Styleguide — CostMyBusiness

<!-- Style tree index. Normative design lives in DESIGN.md. Scaffolded by /project-setup -->

**Canonical source:** [DESIGN.md](../DESIGN.md) (tokens, workbench layout, graph nodes, states, a11y).

Agents and `@verify-ui` use this index; do not invent a second visual system.

## Principles

- Financial modeling workbench (ledger / instrument panel), not neon consumer-fintech.
- Visual signature: **Margin Spine** (revenue → acquisition → delivery → overhead → result).
- Numbers before decoration; financial meaning never by color alone.
- UI copy language: **German**.

## Design tokens (from DESIGN.md)

| Token | Value | Usage |
|---|---:|---|
| `surface.canvas` | `#F4F6F8` | Workbench background |
| `surface.panel` | `#FFFFFF` | Panels, inspector |
| `ink.primary` | `#172033` | Main text/data |
| `ink.muted` | `#657087` | Secondary labels |
| `accent.analysis` | `#3559C7` | Selection, links |
| `semantic.cost` | `#B4493F` | Cost semantics |
| `semantic.profit` | `#16705A` | Profit / contribution |
| `semantic.warning` | `#9A6812` | Incomplete / attention |
| `line.default` | `#D9DEE7` | Dividers / outlines |
| `focus.ring` | `#1E5EFF` | Keyboard focus |

Spacing base: 4 px. Preferred: 4, 8, 12, 16, 24, 32, 48, 64.

## Typography

| Role | Font | Notes |
|---|---|---|
| Display | Manrope (or restrained geometric sans) | Sections |
| Body/UI | Inter or system UI sans | Labels, chrome |
| Numeric | Body + `font-variant-numeric: tabular-nums` | KPIs, node values |

## Layout

- Desktop: graph workbench + inspector (`DESIGN.md` §4).
- Mobile: hierarchy/list first — do not force a mini desktop canvas.
- Breakpoints for verification: mobile 390×844, desktop 1280×720 (`.qa/project.yaml`).

## Stack notes

- Tailwind CSS utility classes mapped to the tokens above.
- shadcn/ui primitives under `src/shared/ui/` — extend, do not fork ad-hoc components.
- Dark mode is out of V1 unless free.

## States (required)

| State | Pattern |
|---|---|
| Loading | skeleton / spinner + `aria-busy` |
| Empty | short German copy + CTA |
| Invalid | field-level message + unit/basis still visible |
| Unsaved / Saving / Save-failed | explicit save chrome; never claim Saved on failure |
| Disabled / Focus / Selected | visible focus ring; selected outline on graph nodes |

## Accessibility

- Target WCAG 2.2 AA.
- Glossary help must work with keyboard (not hover-only).
- Color is never the sole status channel.

## Design quality refs (pipeline — do not run in project-setup)

- Create: `@frontend-design`, `@ux-design-laws` (mandatory with UI)
- Mobile concepts: `@imagegen-frontend-mobile`
- Audit: `@web-design-guidelines`, `@verify-ui`
