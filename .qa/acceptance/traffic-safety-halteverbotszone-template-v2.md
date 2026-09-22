# Feature: 39 Traffic Safety / Halteverbotszone Template V2

## Intent
Product-type template Traffic Safety → Halteverbotszone with five departments and concrete removable positions (FR-019, SCN-027).

## Happy path
- [x] Halteverbotszone template seeds required department/position keys
- [x] Suggested positions removable/disableable without mutating shipped file
- [x] No industry branch in `src/core/calculation`
- [x] Touched files: zero type escape hatches

## Edge Cases
- [x] Removing optional node does not mutate shipped template JSON
- [x] Unknown product-type id → clear German error

## Security Coverage
- F-02 PASS

## Implementation Notes
- `traffic-safety-halteverbotszone.v1.json` + optional `productType` on schema
- Fahrer defaults: rate 28 × hoursPerStop 0.3 × stopsPerOrder 2
- Picker shows industry · productType badge

## Composition Gate
SKIPPED — see `.qa/runs/composition-gate-traffic-safety-halteverbotszone-template-v2.md`

## Verify / Review / ECC
checks PASS · ACCEPT · READY
