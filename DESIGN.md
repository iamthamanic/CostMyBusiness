# CostMyBusiness Design System and UX Rules

Status: Normative V1 UI/UX specification.

## 1. Product design thesis

CostMyBusiness should feel like a **financial modeling workbench**, not a generic admin dashboard and not a playful workflow builder.

The product's visual signature is the **Margin Spine**: a clear vertical economic path that starts with revenue and progressively shows how acquisition, delivery, support and overhead reduce or reshape the result. The graph is the central working object; supporting UI should stay quiet and information-dense around it.

The interface must help a user answer three questions at a glance:

1. What remains?
2. What caused the result?
3. What changes if I change this input?

## 2. Core UX principles

### 2.1 Numbers before decoration

- Primary values are visually dominant.
- Labels explain context; they do not compete with values.
- Decorative charts are not added when the graph/table already communicates the answer.

### 2.2 Traceability is a first-class interaction

Every calculated number should provide a route to:

```text
Result
 -> Layer
 -> Cost / Metric
 -> Driver
 -> Inputs
 -> Formula
```

A user should never be forced to trust an unexplained total.

### 2.3 Automatic structure, explicit control

- CostMyBusiness generates the normal graph structure.
- Users configure values and optional positions.
- Manual node wiring is not the primary interaction.
- Optional generated positions are removable.
- Removing a product node does not mutate the source template.

### 2.4 Financial meaning must not depend on color

Positive/negative/cost/profit states also use:

- labels
- icons or signs
- value prefixes/suffixes
- accessible text

### 2.5 Help is contextual

Definitions should appear where the user meets the term.

Do not force the user to leave the model to learn what CTR, LTV, CAC, COGS, allocation or contribution means.

## 3. Information architecture

Primary navigation:

```text
Overview
Businesses
Products
Scenarios
Templates
Glossary
Settings
```

On narrow screens, navigation becomes a drawer or bottom-accessible menu; do not shrink desktop sidebar labels into unreadable icons-only navigation without accessible names.

## 4. Main product workbench

Desktop layout:

```text
+--------------------------------------------------------------------------------+
| Product / Business                  Actual v   Sep 2026 v   Month v             |
+--------------------------------------------------------------------------------+
| KPI strip: Revenue | CAC | Contribution | Margin | Fully Loaded Profit          |
+----------------------+---------------------------------------------------------+
|                      |                                                         |
| Context / filters    |                  Cost Graph                             |
| - Funnel             |                                                         |
| - View               |            [ Revenue ]                                 |
| - Direct/Loaded      |                 |                                       |
|                      |         [ Acquisition ]                                 |
|                      |          /          \                                   |
|                      |   [Marketing]     [Sales]                               |
|                      |          \          /                                   |
|                      |         [Operations]                                    |
|                      |               |                                         |
|                      |        [Contribution]                                   |
|                      |               |                                         |
|                      |          [Overhead]                                     |
|                      |               |                                         |
|                      |            [Profit]                                     |
|                      |                                                         |
+----------------------+----------------------------------+----------------------+
|                                                         | Node Inspector       |
|                                                         | inputs / formula     |
+---------------------------------------------------------+----------------------+
```

Recommended desktop regions:

- Top context bar: product, Actual/Budget/Scenario, period, save state.
- KPI strip: 4-6 decision metrics only.
- Left utility rail: funnel filter, view mode, compare toggle, graph controls.
- Center: graph.
- Right inspector: selected node details.

Do not permanently reserve a wide left rail if no filter is active; allow collapse.

## 5. Mobile behavior

Do not render the desktop graph as a tiny zoomed canvas by default.

Mobile default:

```text
Product header
Context + Period
KPI cards (2-column or horizontal scroll with full labels)

Economic path
Revenue
  Acquisition
    Marketing
      Google Ads
      SEO
    Sales
  Operations
  Contribution
  Overhead
  Profit

Tap row -> bottom sheet inspector
```

A graph view may remain available as a secondary action on capable devices, but the structured hierarchy is the primary mobile experience.

## 6. Visual direction

The visual language should reference **ledger, model, instrument panel**, not consumer-fintech neon and not generic SaaS gradients.

### 6.1 Palette

Proposed light-first palette:

| Token | Value | Purpose |
|---|---:|---|
| `surface.canvas` | `#F4F6F8` | Workbench background |
| `surface.panel` | `#FFFFFF` | Cards, inspector, menus |
| `ink.primary` | `#172033` | Main text/data |
| `ink.muted` | `#657087` | Secondary labels |
| `accent.analysis` | `#3559C7` | Selection, analytical emphasis, links |
| `semantic.cost` | `#B4493F` | Cost/reduction semantics |
| `semantic.profit` | `#16705A` | Positive contribution/profit semantics |
| `semantic.warning` | `#9A6812` | Incomplete/attention states |
| `line.default` | `#D9DEE7` | Dividers and node outlines |
| `focus.ring` | `#1E5EFF` | Keyboard focus |

Dark mode is later scope unless implementation cost is negligible. Do not compromise V1 contrast or density to support two themes prematurely.

### 6.2 Typography

Use three roles, not three unrelated typefaces.

Proposed:

- Display/section role: **Manrope** or another restrained geometric sans.
- Body/UI role: **Inter** or system-compatible UI sans.
- Numeric/data role: body font with `font-variant-numeric: tabular-nums`; introduce a dedicated mono only where formula/code readability benefits.

If external font loading is undesirable, use a well-defined system stack and preserve the role distinction with weight/size/spacing.

Rules:

- Page/product title: 24-32 px desktop, 22-26 px mobile.
- Section title: 18-20 px.
- Primary KPI value: 24-32 px, semibold, tabular numerals.
- Node primary value: 18-22 px.
- Body: 14-16 px.
- Metadata/utility label: 12-13 px, never below 12 px for essential information.

### 6.3 Spacing

Base grid: 4 px.

Preferred spacing tokens:

```text
4, 8, 12, 16, 24, 32, 48, 64
```

Dense analytical UI should use 8/12/16 more often than oversized whitespace.

### 6.4 Radius and elevation

- Main panel radius: 10-12 px.
- Small controls/chips: 6-8 px.
- Avoid pill-shaped containers for ordinary labels.
- Elevation is subtle; separation should primarily come from borders/surfaces.
- Graph nodes may use a selected outline plus a small elevation increase.

## 7. Cost Graph design

### 7.1 Node anatomy

```text
+----------------------------------+
| OPERATIONS                  (?)  |
|                                  |
| 29.40 EUR / order                |
| 39.3% of net revenue             |
|                                  |
| 6 positions                      |
+----------------------------------+
```

Each meaningful node supports:

- type/layer label
- primary calculated value
- basis (`/ order`, `/ month`, etc.)
- optional share/delta
- incomplete/error indicator
- glossary/help affordance when relevant
- selected/focus state

### 7.2 Node types

Visual distinction should be restrained:

- Revenue node: neutral/analysis emphasis.
- Cost node: cost semantic accent.
- Funnel node: analysis accent plus funnel icon/label.
- Result node: stronger border/value weight.
- Group node: container/summary treatment.
- Driver node: compact utility node when displayed.

Do not assign a random color to every node type.

### 7.3 Edges

Edges communicate dependency, not decoration.

- Default: neutral line.
- Selected path: analysis accent.
- Cost reduction direction can use labels/values rather than red arrows everywhere.
- Avoid continuous edge animation.

### 7.4 Layout

- Automatic layout is default.
- Primary economic path is top-to-bottom.
- Parallel funnels branch horizontally and converge before downstream shared costs where appropriate.
- Graph controls: fit, zoom in/out, reset layout, collapse groups, search.
- User may reposition nodes for readability, but business structure stays domain-controlled.

## 8. KPI strip

Default product KPIs:

```text
Net Revenue / Unit
CAC
Contribution / Unit
Contribution Margin
Fully Loaded Profit / Unit
```

Show only metrics that are valid for the current model. Do not show `0` when the metric is actually unresolved.

Unresolved state example:

```text
CAC
--
Needs acquired customers
```

## 9. Node Inspector

Inspector is the main editing surface.

Sections in order:

1. Identity and help
2. Current result
3. Classification
4. Inputs
5. Driver/basis
6. Formula
7. Allocation (when applicable)
8. Impact / dependent metrics
9. Advanced actions

Example:

```text
Driver
Operations / Variable / Direct

16.67 EUR per order

Inputs
Hourly full cost       25.00 EUR
Hours per order         0.667

Formula
hourly_cost * hours_per_order
[Edit formula]

Used by
Operations total
Contribution
Fully Loaded Profit
```

## 10. Formula Editor

The formula editor is structured, not a raw developer console.

Required features:

- syntax highlighting
- stable metric/node reference autocomplete
- validation as user types or on short debounce
- current computed result preview
- formula source badge: `Default`, `Template`, `Custom`
- reset to inherited/default
- unknown symbol explanation
- dependency cycle explanation

Example UI:

```text
CAC formula                              Custom
(marketing.total + sales.total) / customers.new

Valid formula
Current result: 12.48 EUR

[Reset to default]
```

Never show raw parser stack traces.

## 11. Funnel UX

A funnel should be editable both as stages and as cost context.

Desktop stage view:

```text
500,000 Impressions
      | CTR 5.0%
      v
25,000 Clicks
      | CVR 8.0%
      v
2,000 Orders
```

Side panel:

```text
Media spend          10,000 EUR
Agency                 1,500 EUR
Internal personnel       900 EUR
Tools                    100 EUR

Media CPA               5.00 EUR
Full marketing CAC      6.25 EUR
```

Rules:

- Stage values and conversion rates must make their derivation clear.
- If both adjacent stage counts and conversion rate are editable, define which value is authoritative for that configuration and show it.
- Do not silently overwrite an explicitly entered value due to another edited derived value.

## 12. Scenario UX

Context control:

```text
[ Actual v ] [ Sep 2026 v ] [ Month v ]
```

Scenario creation:

```text
Create scenario
Name: Better Google conversion
Base: Actual Sep 2026
```

Changed values visibly indicate inheritance:

```text
Google CVR
Actual     9.2%
Scenario  12.0%   overridden
```

Comparison view:

| Metric | Actual | Budget | Better CVR | Route optimization |
|---|---:|---:|---:|---:|
| Revenue | ... | ... | ... | ... |
| CAC | ... | ... | ... | ... |
| Operations / unit | ... | ... | ... | ... |
| Contribution | ... | ... | ... | ... |
| Margin | ... | ... | ... | ... |

Delta semantics must indicate the direction that is economically favorable; do not assume every higher value is good.

## 13. Template onboarding

### Step 1 - Business

```text
Business name
Default currency
```

### Step 2 - Industry

```text
SaaS
E-commerce
Traffic Safety
Service
Other / Custom
```

### Step 3 - Product type

Traffic Safety example:

```text
Temporary no-parking zone
Traffic safety setup
Road closure
Traffic sign plan
Custom
```

### Step 4 - Suggested model

Show sections with checkboxes/toggles, not an unexplained finished graph.

```text
Operations suggestions
[x] Permits / authority fees
[x] Driver labor
[x] Vehicles
[x] Traffic equipment
[x] Setup and removal
[x] Storage
[ ] External subcontractors
```

Copy must make clear:

> These are suggested starting positions. You can remove or change them at any time.

### Step 5 - First inputs

Only ask for the minimum inputs needed to make the model useful. Do not turn onboarding into a full accounting interview.

## 14. Layer help

Every standard layer has:

- one-sentence definition
- common contents
- industry-specific suggestions when available
- direct vs allocated guidance when relevant

Example content structure:

```text
Operations
Costs required to deliver the sold product or service.

Common examples
Labor, material, vehicles, logistics, infrastructure, subcontractors.

Traffic Safety examples
Drivers, vehicles, signs/equipment, permits, setup/removal, storage.
```

## 15. Glossary tooltips

Tooltip trigger appears immediately after a term, not detached from the label.

```text
CTR (i)
```

Content:

```text
Click-Through Rate
Share of impressions that lead to a click.

Formula
Clicks / Impressions * 100

Example
5,000 clicks / 100,000 impressions = 5%

[Open in glossary]
```

Accessibility:

- trigger is focusable button or accessible interactive element
- `aria-describedby`/popover semantics as appropriate
- Escape closes
- focus returns to trigger
- touch works on tap
- no essential information depends on hover timing

## 16. Tables and numeric formatting

- Right-align comparable numeric columns.
- Use tabular numerals.
- Currency: locale-aware with explicit currency.
- Percentages: consistent decimal precision within a table.
- Large counts may use compact display only when exact value is available on hover/focus/details.
- Negative values use minus sign plus semantic label/color, never parentheses-only unless user selects accounting format later.

## 17. Input behavior

Each input clearly shows its basis.

Good:

```text
Driver full cost
[ 25.00 ] EUR / hour
```

Bad:

```text
Cost
[ 25 ]
```

Validation rules:

- validate close to the field
- preserve user input where possible
- state expected range/unit
- never silently clamp a financial input
- derived fields are visually different from editable fields

## 18. Save state

Top bar always communicates persistence state when persistence exists:

```text
Saved
Unsaved changes
Saving...
Save failed - Retry
```

Do not display `Saved` until persistence acknowledges success.

## 19. Empty states

Examples:

### No product

```text
No product model yet.
Create a product from an industry template or start custom.
[Create product]
```

### No funnel

```text
No acquisition funnel configured.
Add a funnel if you want to compare CAC and profitability by channel.
[Add funnel]
```

Empty states explain the value of the next action without marketing fluff.

## 20. Error language

Preferred:

```text
CAC cannot be calculated because acquired customers is 0.
Enter a customer count greater than 0 or change the formula.
```

Avoid:

```text
Calculation error.
Something went wrong.
```

Use generic error wording only when the system truly lacks a more specific safe reason.

## 21. Loading behavior

- Skeletons for initial model/persistence load.
- Local calculations should not display loading spinners for normal edits.
- If future calculation moves to a worker, preserve input responsiveness and use subtle calculating status only for noticeable latency.

## 22. Interaction and motion

Motion is functional and restrained.

Allowed:

- 120-180 ms inspector open/close
- 120-200 ms selected-node emphasis
- graph layout transition when a structure changes, if it does not disorient
- number transition only when it improves change tracking and respects reduced motion

Avoid:

- ambient animated backgrounds
- continuously animated graph edges
- bouncing KPI cards
- animation that delays data reading

Respect `prefers-reduced-motion`.

## 23. Keyboard behavior

Minimum:

- Tab reaches all controls.
- Enter/Space activates nodes/buttons as appropriate.
- Escape closes tooltip/popover/inspector modal variants.
- Graph has a keyboard-accessible hierarchy/list alternative.
- Formula editor follows expected text editor semantics.
- Selected node is announced in an accessible way.

## 24. Responsive breakpoints

Do not bind product behavior to exact framework defaults; use content-driven thresholds.

Recommended starting points:

```text
< 768 px      mobile hierarchy layout
768-1099 px   compact workbench, collapsible inspector
>= 1100 px    full graph + side inspector
>= 1440 px    wider inspector / denser comparison
```

Verify at minimum:

- 390x844
- 768x1024
- 1280x720
- 1440x900

## 25. Accessibility requirements

Target WCAG 2.2 AA.

Must verify:

- visible focus
- keyboard-only flows
- 200% zoom/reflow
- text/background and interactive contrast
- no color-only status
- tooltip/popover semantics
- form labels and units
- graph hierarchy alternative
- reduced motion
- screen-reader-friendly KPI labels

## 26. Content language

Default UI language: German.

Code identifiers and repository technical documentation may use English.

Business acronyms may remain conventional (CAC, CTR, LTV), but their German plain-language explanation must be available through glossary help.

## 27. Component rules

### Shared UI primitives

A shared component must be generic presentation behavior used by multiple slices.

Examples:

- Button
- Input
- Select
- Popover
- Tooltip
- Dialog
- Table primitives
- Tabs
- Badge

Do not move a business-specific component into `shared/ui` just because two files use it.

### Feature components

Examples:

- CostNode
- FunnelStageEditor
- ScenarioComparison
- TemplateReviewList
- FormulaEditor

These stay inside their owning feature slice.

## 28. Design anti-patterns

Do not ship:

- a dashboard made primarily of unrelated cards
- rainbow node colors
- large gradients as data decoration
- a graph that requires users to manually wire standard business dependencies
- hover-only explanations
- tiny text to achieve density
- hidden formula provenance
- `0` used in place of unknown/unresolved
- modals for every edit when a persistent inspector is more appropriate
- mobile graph forced into a desktop canvas
- vague labels such as `Value`, `Cost`, `Data` when a unit/basis exists

## 29. V1 screen inventory

1. Sign in / session gate (if persistence is enabled)
2. Overview
3. Businesses list
4. Business detail
5. Product creation wizard
6. Product workbench
7. Scenario management/comparison
8. Templates
9. Glossary
10. Settings

## 30. Design acceptance checklist

A feature is not UI-complete until:

- loading/empty/error/success/disabled/focus states are defined where applicable
- keyboard path works
- mobile behavior is intentional
- glossary terms are wired to central definitions
- numeric basis/unit is visible
- direct/allocated status is visible where relevant
- derived vs editable values are distinguishable
- user can trace a calculated result to its source
- visual treatment uses semantic tokens rather than ad-hoc colors
- screenshots at defined viewports show no clipped essential data
