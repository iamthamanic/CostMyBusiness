# Composition gate — shipped-templates

**Verdict:** SKIPPED
**HEAD (at proof write):** WORKTREE — refresh after commit

## Scope
Template JSON → applyShippedTemplate → DomainModel; product create stores templateId.

## Skip reason
Single-hop / no producer→consumer side-effect path:
- No outbox, queue, webhook, mail, or bulk fan-out
- No write-in-A / async read-in-B pipeline
- Calculation remains pure in `src/core/**`

Simulations N-actors / invalid fallback / concurrent consumers: N/A for static shipped data + local product row.
