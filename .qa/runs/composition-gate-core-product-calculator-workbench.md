# Composition Gate — core-product-calculator-workbench

- HEAD_SHA: WORKTREE
- Date: 2026-09-22
- Verdict: SKIPPED

## Event
User edits product price / cost / funnel inputs; workbench recomposes model and evaluates totals.

## Hop chain
UI input → DomainModel / FunnelRepository → composeFunnelsIntoModel → evaluate() → projectWorkbenchView → ResultSpine

## Simulations
| Case | Intended | Composed | Result |
|------|----------|----------|--------|
| 1 event, N actors | One edit → one remapped spine | Same; no fan-out | pass |
| invalid / missing | unresolved German, not NaN | Same | pass |
| 2 consumers / crash | No async workers | n/a | pass |

## Flags
| Tag | Severity | Hops | Why | Fix |
|-----|----------|------|-----|-----|
| (none) | | | | |

## Skip reason
In-process compose + pure evaluate; no async consumer / side-effect hops.
