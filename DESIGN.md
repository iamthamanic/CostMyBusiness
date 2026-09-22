# CostMyBusiness Design System and UX Rules

Status: Normative V1 UI/UX specification.

## 1. Product design thesis

CostMyBusiness is a **visual product calculator**, not a dashboard with an explanatory graph and a side inspector as the main editor.

The product's visual signature is the **Margin Spine**: a clear top-to-bottom economic path that starts with the product selling price and shows where every euro goes until contribution, allocated overhead, profit, and margin remain. The **Cost Graph itself is the primary calculator and editing surface**. Supporting UI stays quiet around it.

Mental model:

```text
PRODUCT (gross price)
        |
        v
TAX / PRICE NORMALIZATION (VAT is not a cost)
        |
        v
NET REVENUE
        |
        +------------------+------------------+
        v                  v                  ...
   MARKETING          OPERATIONS
   (department)       (department)
        |                  |
   concrete cost      concrete cost
   / funnel nodes     calculator nodes
        \                  /
         +--------+--------+
                  v
            TOTAL COST
                  v
            CONTRIBUTION
                  v
         OVERHEAD / ALLOCATED
                  v
               PROFIT
                  v
               MARGIN
```

The interface must help a user answer:

1. From my selling price: where does each euro go?
2. What remains at the end?
3. What changes if I change this input **on the node**?

Normative rule (overrides any older wording in this file):

> **The Cost Graph is the primary calculator and editing surface. The Inspector is a secondary advanced-detail surface.**

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

Desktop layout — **graph-first calculator** (inspector optional / collapsible):

```text
+--------------------------------------------------------------------------------+
| Product / Business                  Actual v   Sep 2026 v   Month v             |
+--------------------------------------------------------------------------------+
| KPI: Net Revenue | CAC | Contribution | Margin | Fully Loaded Profit            |
+----------------------+---------------------------------------------------------+
| Context / filters    |                  Cost Graph (PRIMARY EDITOR)            |
| - Funnel             |                                                         |
| - Contribution vs    |   [ Product 89,00 EUR brutto ]                          |
|   Fully Loaded       |              |                                          |
| - Collapse / search  |   [ Tax 19% → Net 74,79 ]                               |
|                      |              |                                          |
|                      |   [ Marketing ]     [ Operations ]                      |
|                      |    + Google Ads      + Fahrer  [inputs inline]          |
|                      |    + SEO             + Fahrzeug …                       |
|                      |              \      /                                   |
|                      |           [ Total Cost → Contribution → Profit ]        |
+----------------------+----------------------------------+----------------------+
| (optional) Advanced Inspector — formula / allocation / provenance / glossary   |
+--------------------------------------------------------------------------------+
```

Recommended desktop regions:

- Top context bar: product, Actual/Budget/Scenario, period, save state.
- KPI strip: 4–6 decision metrics only.
- Left utility rail (collapsible): funnel filter, Contribution vs Fully Loaded view, graph controls (fit/zoom/search/collapse).
- **Center: Cost Graph — primary editing surface for normal inputs.**
- Right inspector: **secondary**; open on demand for advanced formula, allocation, provenance, glossary, rename/duplicate/delete, extended drivers.

Do not permanently reserve a wide inspector. Normal cost inputs must be editable **inside the selected/expanded node** without opening the inspector.

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

A graph view may remain available as a secondary action on capable devices, but the structured hierarchy is the primary mobile experience. Hierarchy rows that represent **cost calculator nodes** still expose primary inputs inline (or in an expandable row); the bottom sheet is for advanced inspector concerns, not for every scalar edit.

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

### 7.0 Primary calculator rule

The Cost Graph is the **primary calculator and editing surface**. Users edit ordinary drivers and rates **on the node**. Selecting a node may expand it; it must not be required to open the Inspector for everyday cost entry.

### 7.1 View node types (visualization only)

Map domain nodes to a small set of **view** components. Do not hardcode industry logic in React. DomainModel remains SoR; React Flow objects are not persisted as business truth.

| View type | Role |
|---|---|
| Product / Price Root | Selling price, price kind (gross/net), VAT, pricing basis, currency |
| Revenue | Derived net revenue (and related revenue displays) |
| Department / Group | Cluster subtotal (Marketing, Sales, Operations, Support, Overhead) — not a cost position |
| Cost Calculator | Concrete cost position with inline inputs + short derivation + result |
| Funnel | Specialized marketing/sales funnel view over existing funnel domain |
| Result | Total cost, contribution, allocated overhead, profit, margin |

### 7.2 Department clusters vs cost positions

Marketing, Sales, Operations, Support, and Overhead are **grouping / subtotal nodes**. They are not the cost positions themselves. Each concrete position is its own Cost Calculator (or Funnel) node; the department shows the sum of enabled children.

### 7.3 Cost Calculator node anatomy

Expanded example:

```text
+----------------------------------+
| Fahrer                           |
| Operations · Variable · Direct   |
|                                  |
| Vollkosten / Stunde   [ 28,00 ]  |
| Stunden / Stopp       [  0,30 ]  |
| Stopps / Auftrag      [  2,00 ]  |
|                                  |
| 28,00 × 0,30 × 2                 |
| -------------------------------- |
| 16,80 EUR / Auftrag              |
+----------------------------------+
```

Every cost calculator node supports at least:

1. Name
2. Department / cluster
3. Cost behavior / basis
4. Relevant editable inputs (schema-driven, not one React component per cost kind)
5. Short visible formula / derivation
6. Result for the relevant unit
7. Unresolved / error state (never silent `0` / `NaN` / `Infinity`)
8. Collapsed / expanded state (collapsed: name + result only)

### 7.4 Inline input rendering

Render inputs from `costBehavior` + input definitions (and later template-declared schemas). Examples: `per_hour`, `per_km`, `per_stop`, `fixed_period`, `per_order`, `percentage_revenue`, `custom_formula`. Custom templates must be able to declare input schemas without new React components.

### 7.5 Product pricing / tax (not a cost)

VAT / tax normalization sits between gross selling price and economic net revenue. Tax is **not** a cost position. Product pricing fields (gross|net, tax rate, pricing basis, currency) are the source of truth; the graph derives displayed revenue nodes from them (no duplicate SoR).

### 7.6 Funnel nodes in the tree

Marketing funnels appear as specialized nodes under the Marketing department (budget, stages, operating costs, media CPA / fully-loaded CAC). Reuse existing funnel domain and metrics; do not duplicate calculation in the graph view. Separate funnel panels may remain as secondary surfaces but the main tree must show funnel nodes.

### 7.7 Result spine (bottom of flow)

Visible end-of-flow results:

- Total Direct Cost
- Contribution / Deckungsbeitrag
- Allocated Overhead
- Fully Loaded Profit
- Margin

Direct and allocated must stay distinguishable. A view toggle switches Contribution View vs Fully Loaded View.

### 7.8 Layout

- Automatic top-to-bottom layout remains default.
- ELK (or equivalent) must use real/expanded node dimensions so multiple concrete cost nodes are visible — not only five large department cards.
- Controls: fit, zoom, reset layout, collapse/expand departments and nodes, search.
- Manual wiring is not primary UX.
- User may reposition for readability; business structure stays domain-controlled.

### 7.9 Edges and visual distinction

Edges communicate dependency, not decoration. Restrained distinction by view type (revenue / cost / funnel / result / group). Do not assign a random color to every node type. Financial meaning must not depend on color alone.

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

## 9. Node Inspector (secondary)

The Inspector is a **secondary advanced-detail surface**, not the main editing surface.

Use it for:

- Advanced formula editing
- Allocation configuration
- Provenance / derivation detail
- Glossary / help depth
- Dependencies
- Rename / duplicate / delete
- Extended driver configuration beyond the inline schema

Do **not** require the Inspector for ordinary cost inputs (rates, hours, stops, amounts). Those belong on the Cost Calculator / Funnel node.

When open, sections in order:

1. Identity and help
2. Current result
3. Classification
4. Inputs (advanced / overflow)
5. Driver/basis
6. Formula
7. Allocation (when applicable)
8. Impact / dependent metrics
9. Advanced actions

Example (advanced only):

```text
Driver
Operations / Variable / Direct

16.67 EUR per order

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
