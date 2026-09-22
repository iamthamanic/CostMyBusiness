# Feature: 38 Inline Cost Calculator Nodes

## Intent
Schema-driven Cost Calculator nodes edit inputs inline and show short derivation + result without Inspector (FR-008c/d, SCN-028).

## Happy path
- [x] Inline edit updates cascade without Inspector
- [x] Inputs render from behavior/schema definitions
- [x] Unresolved never silent 0/NaN/Infinity
- [x] Touched files: zero type escape hatches

## Edge Cases
- [x] Missing required input → unresolved German message on node
- [x] Derived fields visually distinct from editable fields

## Security Coverage
- F-02 / FE-03 PASS

## Implementation Notes
- input-schemas.ts registry; CostGraphNode expand/+ inline fields
- per_hour supports hoursPerStop×stopsPerOrder (prefer over hoursPerOrder)
- ELK height grows when expanded

## Composition Gate
SKIPPED — see `.qa/runs/composition-gate-inline-cost-calculator-nodes.md`

## Verify / Review / ECC
checks PASS · ACCEPT · READY
