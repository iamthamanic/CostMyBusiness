# Composition Gate — workbench-tabs-marketing-retarget

- HEAD_SHA: (filled after commit)
- Date: 2026-09-23
- Verdict: SKIPPED

## Event
User switches product tabs / edits funnel campaigns or retarget CPA; workbench recomposes model and evaluates Margin Spine.

## Hop chain
UI (OverviewPage tabs / MarketingFunnelCard) → FunnelRepository.update → composeFunnelsIntoModel → calculateMarketingMetrics (blend + retarget add) → evaluate() → projectWorkbenchView → ProductRootCard / ResultSpine

## Simulations
| Case | Intended | Composed | Result |
|------|----------|----------|--------|
| 1 event, N actors | One campaign edit → one remapped funnel cost | Same; no fan-out workers | pass |
| invalid / missing | unresolved German, not NaN | Same | pass |
| 2 consumers / crash | No async outbox | n/a | pass |

## Flags
| Tag | Severity | Hops | Why | Fix |
|-----|----------|------|-----|-----|
| (none) | | | | |

## Skip reason
In-process compose + pure evaluate; local repository persistence only; no async consumer / side-effect hops.
