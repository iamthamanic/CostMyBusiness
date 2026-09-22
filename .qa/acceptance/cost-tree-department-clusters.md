# Feature: 37 Cost Tree Workbench Redesign / Department Clusters

## Intent

Redesign the Cost Graph so Marketing/Sales/Operations/Support/Overhead are department cluster subtotals with visible concrete children; graph is primary; Inspector optional (FR-008b, SCN-027).

## Happy path

- [ ] Departments render as cluster subtotals with visible children
- [ ] Inspector not required for viewing concrete costs; primary graph layout works
- [ ] Contribution vs Fully Loaded keeps direct/allocated distinguishable
- [ ] Touched files: zero type escape hatches

## Edge Cases

- [ ] Collapsed department shows name + subtotal only
- [ ] Empty department shows German empty guidance, not fake zeros

## Security Coverage

- F-02 existing model validation
- Out of scope: new persistence

## Implementation Notes

<!-- after coding -->
