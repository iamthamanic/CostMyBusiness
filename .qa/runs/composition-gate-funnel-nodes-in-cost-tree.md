# Composition Gate — funnel-nodes-in-cost-tree

- HEAD_SHA: WORKTREE
- Date: 2026-09-22
- Verdict: SKIPPED

## Event
User edits funnel operating costs from a Cost Graph funnel node; graph remaps CAC display from existing funnel metrics.

## Hop chain
CostGraphNode inline input → FunnelRepository.update (local) → in-memory funnel list → mapFunnelsToFlow (pure metrics) → RF node label

## Simulations
| Case | Intended | Composed | Result |
|------|----------|----------|--------|
| 1 event, N actors | One funnel update → one remapped node | Same; no fan-out to other products | pass |
| invalid / missing | Load/save error → German alert; empty list → no fake nodes | Same | pass |
| 2 consumers / crash | No async worker; sync local update | n/a | pass |

## Flags
| Tag | Severity | Hops | Why local review missed it | Fix |
|-----|----------|------|----------------------------|-----|
| (none) | | | | |

## Skip reason
Single-hop local CRUD + pure metric remap into RF; no async consumer / side-effect hops (same class as marketing-funnels / inline-cost-calculator-nodes).
