# CostMyBusiness project-specific edge cases

## Global

| ID | Case | Fail if |
|---|---|---|
| G-01 | App loads | Blank screen or uncaught console errors |
| G-02 | Default locale | Default UI is not German |
| G-03 | Unknown result | NaN/Infinity/false zero is shown to user |

## Calculation

| ID | Case | Fail if |
|---|---|---|
| C-01 | Divide by zero | Raw Infinity/NaN is displayed |
| C-02 | Missing dependency | Result is shown as valid without explanation |
| C-03 | Formula cycle | Formula saves or evaluation loops |
| C-04 | Currency mismatch | Mixed currency is silently aggregated |
| C-05 | Scenario orphan | Removed base target silently keeps applying override |

## Security

| ID | Case | Fail if |
|---|---|---|
| S-01 | Formula input | User formula can execute JavaScript or browser APIs |
| S-02 | XSS | User labels/template text can execute HTML/script |
| S-03 | Ownership | User can read/write another workspace's model |
| S-04 | Secret in client | Privileged credentials enter client bundle/storage |
| S-05 | Error response | Stack trace, secret, financial value or formula content leaks unexpectedly |

## UI/UX

| ID | Case | Fail if |
|---|---|---|
| U-01 | Mobile graph | Essential workflow requires manipulating tiny desktop canvas |
| U-02 | Tooltip | Essential definition requires mouse hover |
| U-03 | Unit/basis | Editable numeric cost does not state unit/basis |
| U-04 | Save failure | Local edits are discarded or UI claims Saved |
| U-05 | Color semantics | Profit/cost meaning is conveyed by color only |