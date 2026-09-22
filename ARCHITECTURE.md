# CostMyBusiness Architecture

Status: Normative architecture specification for V1.

## 1. Architecture style

CostMyBusiness uses a **modular monolith organized as vertical slices**, with a small shared domain core for universal financial/modeling concepts.

This is intentionally not a classic whole-application Onion Architecture. Onion-style dependency direction is still enforced inside the core and inside slices where useful.

```text
Application composition
        |
        v
Vertical feature slices
        |
        +------> Shared domain core
        |
        +------> Shared UI / infrastructure
        |
        v
Persistence / external adapters
```

Primary rule:

> Organize code around product capabilities that change together. Isolate only truly universal business rules in `core/`.

## 2. Why Vertical Slice

CostMyBusiness has independent product capabilities that can evolve separately:

- Businesses
- Products
- Cost Graph
- Funnels
- Scenarios
- Templates
- Glossary
- Reporting

A feature change such as Scenario Comparison should remain mostly inside the Scenario slice instead of requiring edits across global `presentation/application/domain/infrastructure` folders.

## 3. Repository target structure

```text
src/
  app/
    router/
    providers/
    layouts/

  core/
    model/
    calculation/
    formulas/
    metrics/
    periods/
    money/
    allocation/

  features/
    businesses/
      domain/
      application/
      ui/
      persistence/
      index.ts

    products/
      domain/
      application/
      ui/
      persistence/
      index.ts

    cost-graph/
      domain/
      application/
      ui/
      index.ts

    funnels/
      domain/
      application/
      ui/
      persistence/
      index.ts

    scenarios/
      domain/
      application/
      ui/
      persistence/
      index.ts

    templates/
      domain/
      application/
      ui/
      persistence/
      index.ts

    glossary/
      application/
      ui/
      index.ts

    reporting/
      application/
      ui/
      index.ts

  shared/
    ui/
    infrastructure/
    validation/

  integrations/
    supabase/
    external/

  data/
    default-templates/
    glossary/

tests/
supabase/
  migrations/
.qa/
PRD.md
ARCHITECTURE.md
DESIGN.md
AGENTS.md
README.md
```

Not every slice must contain every subfolder. Add a folder only when that slice needs the corresponding boundary.

## 4. Dependency rules

### 4.1 Global direction

```text
app
 |
 v
features ------------------+
 |                         |
 v                         v
core                     shared
 ^                         ^
 |                         |
integrations / persistence adapters
```

More precisely:

- `app/` may import public APIs from `features/` and presentation utilities from `shared/`.
- `features/*/ui` may import its own application/domain modules, public core APIs, and `shared/ui`.
- `features/*/application` may import its own domain and core.
- `features/*/domain` may import only core domain contracts that are truly universal.
- `core/` must never import from `features/`, `app/`, React, React Flow, Supabase, browser APIs, or UI libraries.
- `integrations/` implements interfaces/contracts owned by the relevant feature/application layer or shared infrastructure contract.
- A feature must not import internal paths from another feature. Cross-feature use goes through that feature's `index.ts` public API or through core contracts.

### 4.2 Forbidden examples

```text
core/calculation -> React                  FORBIDDEN
core/formulas -> Supabase                  FORBIDDEN
features/scenarios/domain -> React Flow    FORBIDDEN
features/products/ui -> Supabase tables    FORBIDDEN
features/templates -> traffic-safety if/else branches in core  FORBIDDEN
```

### 4.3 Allowed examples

```text
features/cost-graph/ui -> core/model
features/cost-graph/ui -> core/calculation result contracts
features/scenarios/application -> core/calculation
integrations/supabase -> product repository contract
app/router -> features/products public route export
```

## 5. Core domain ownership

Only concepts shared by multiple feature slices and stable across industries belong in `core/`.

### `core/model`

Owns:

- stable IDs
- node types
- edge/dependency contracts
- typed scalar/value references
- graph invariants
- model schema version

It does not own visual positions or React Flow shapes.

### `core/calculation`

Owns:

- dependency ordering
- graph evaluation
- unresolved/error result propagation
- result provenance
- deterministic recalculation
- result snapshots

It receives a normalized domain model and returns typed results.

It does not persist data and does not render UI.

### `core/formulas`

Owns:

- tokenization
- parsing
- AST
- symbol validation
- supported operators/functions
- dependency extraction
- cycle detection support
- evaluation
- typed formula errors

Forbidden:

- `eval`
- `new Function`
- JavaScript execution
- DOM access
- network calls
- file access
- arbitrary function registration from user input

Initial supported expression surface should remain deliberately small:

```text
+
-
*
/
%
()
SUM(...)
AVG(...)
MIN(...)
MAX(...)
ROUND(...)
IF(condition, a, b)
```

Add functions only when a real product requirement needs them.

### `core/periods`

Owns:

- Day / Week / Month / Quarter / Year definitions
- native period basis
- normalization contracts
- time-basis labels
- period conversion rules

Important: not every value can be divided/multiplied naively. Hourly, per-order, monthly fixed, annual fixed and volume-based costs retain their native basis.

### `core/money`

Owns:

- currency code
- decimal-safe arithmetic boundary
- rounding policy
- display conversion helpers that do not contain UI rendering

Raw floating-point assumptions must not leak through financial calculations.

Exact decimal implementation is selected before VS-01 implementation. The public `Money`/`DecimalValue` contract must hide the implementation choice.

### `core/metrics`

Owns universal metric definitions and stable IDs, for example:

- revenue
- net revenue
- CTR
- CPC
- CVR
- CPA
- CAC
- contribution
- contribution margin
- fully loaded profit
- break-even units

Industry-specific metrics belong in template configuration unless they are demonstrably universal.

### `core/allocation`

Owns generic shared-cost allocation strategies:

- per unit
- per order
- per customer
- per FTE
- per hour
- percentage
- custom driver reference

It must preserve provenance: an allocated cost result knows its source pool and allocation rule.

## 6. Domain graph vs visualization graph

This boundary is mandatory.

```text
Domain Model
    |
    v
Graph View Mapper
    |
    v
React Flow nodes / edges
```

Do not persist React Flow objects as business truth.

Domain node example:

```text
id
kind
category
label
formulaRef / driverRef
classification
metadata
```

Visualization node example may contain:

```text
position
width
height
selected
React component type
viewport metadata
```

Only view-specific values belong to the visualization layer. If user layout positions are persisted, keep them in a separate presentation/layout record keyed by stable domain node ID.

## 7. Automatic graph construction

The user configures the model; the user does not normally wire it.

Template/model application creates domain relationships automatically.

Example:

```text
Revenue
  -> Acquisition
      -> Marketing funnels
      -> Sales
  -> Delivery / Operations
  -> Support
  -> Contribution
  -> Overhead
  -> Fully Loaded Profit
```

A visualization layout engine such as ELK may position nodes, but it never decides business dependencies.

Business dependencies come from domain/template rules.

## 8. Node model

Keep the universal node taxonomy small.

Recommended domain node kinds:

```text
RevenueNode
CostNode
DriverNode
FunnelNode
AllocationNode
ResultNode
GroupNode
```

Do not create industry-specific node classes such as `VehicleCostNode`, `SaaSCloudNode`, or `TrafficSafetyPermitNode` unless a future universal behavior genuinely differs.

Industry meaning is configuration:

```text
CostNode
  category: operations
  subtype: vehicle
  driver: km
```

## 9. Cost classification

Each cost must expose the economic meaning required for analysis.

Recommended independent attributes:

```text
attribution:
  direct | allocated

behavior:
  variable | semi_variable | fixed | overhead

basis:
  unit | order | customer | employee | hour | km | stop |
  transaction | click | api_call | percentage_revenue |
  day | week | month | quarter | year | custom
```

Do not encode these as one giant enum because the dimensions are independent.

## 10. Funnels

A funnel is an ordered sequence of stages plus costs associated with that acquisition/sales path.

Example:

```text
Impressions
  -- CTR --> Clicks
  -- CVR --> Orders
```

B2B example:

```text
Clicks -> Leads -> MQL -> SQL -> Demo -> Proposal -> Won
```

Funnel stage conversion logic belongs to the funnel slice/core metric contracts, not the graph visualization.

Funnel costs may include:

- media spend
- agency
- internal personnel
- tools
- commission
- CRM/telephony

Media CPA and fully loaded acquisition cost are separate metrics.

## 11. Scenario model

Actual, Budget and Scenario are domain concepts, not UI filters.

Recommended model:

```text
Actual   = persisted period values
Budget   = persisted planned values
Scenario = base context + sparse overrides
```

Scenario resolution:

```text
resolvedValue(target) =
  scenarioOverride(target)
  ?? resolve(baseContext, target)
```

Rules:

- Scenario inheritance must not cycle.
- Removing an override restores inheritance.
- Orphaned overrides are visible and excluded from calculation until resolved.
- Do not clone an entire product graph for every scenario.

## 12. Template architecture

### Shipped templates

Stored as versioned repository data under:

```text
src/data/default-templates/
```

Initial families:

- SaaS
- E-commerce
- Service
- Traffic Safety
- Custom

A template may define:

- recommended layers/groups
- nodes
- driver defaults
- formulas
- funnels
- glossary references
- guidance content
- suggested KPIs

### User templates

Persisted as owner data.

Saving a custom template copies normalized domain configuration into a versioned custom template object. It must not mutate the shipped template from which a product originated.

### Industry extensibility rule

Adding a new industry should normally require:

1. new template data;
2. new glossary/guidance data when needed;
3. zero changes to the calculation engine.

A core change is justified only when the industry reveals a genuinely generic business concept missing from the domain.

## 13. Glossary architecture

The glossary is a single source of truth.

Recommended record:

```text
id
term
fullName
shortDefinition
definition
formulaDescription?
example?
category
relatedTermIds[]
```

UI surfaces reference a glossary term by stable ID. Do not duplicate definitions in individual components.

Shipped glossary entries are versioned repository data.

## 14. Persistence architecture

Recommended V1 production persistence: Supabase/Postgres/Auth/RLS.

The domain must not depend on Supabase types.

```text
Feature/application repository interface
          ^
          |
Supabase adapter implementation
```

Example contracts:

```text
ProductRepository
  load(productId)
  save(model, expectedVersion)
  delete(productId)

TemplateRepository
  listCustom()
  saveCustom(template)
  deleteCustom(templateId)
```

All user-owned rows must be workspace/owner scoped and protected by RLS in production.

## 15. Local editor state vs persisted state

Do not treat every keystroke as a database transaction.

Recommended flow:

```text
Persisted model
    -> editor state
    -> local validation/recalculation
    -> dirty state
    -> explicit/debounced save boundary
    -> persistence adapter
```

UI must distinguish:

- saved
- unsaved
- saving
- save failed

A save failure must not discard local edits.

## 16. State management

Recommended client-state tool: Zustand.

Use it for editor/session state such as:

- selected node
- active period
- active context/scenario
- active funnel filter
- inspector state
- unsaved changes
- graph viewport/layout state

Do not use the global store as a replacement for domain objects or repository contracts.

## 17. Security boundaries

### Formula boundary

All formula input is hostile until parsed and validated.

### Persistence boundary

All client-supplied IDs and records are hostile until authorization and schema validation succeed.

### Rendering boundary

User labels/names render as text, not HTML.

### Secret boundary

No privileged keys in the client bundle. Supabase service-role keys or equivalent server secrets never enter Vite-exposed environment variables.

## 18. Validation

Use runtime validation at persistence/integration boundaries.

Recommended: Zod or equivalent.

TypeScript types alone are not sufficient for data loaded from storage or external systems.

## 19. Testing architecture

### Core unit tests

Highest priority. Must run without browser, React, React Flow or Supabase.

Test:

- graph ordering
- formula parser/evaluator
- formula cycles
- missing references
- zero denominators
- period normalization
- allocation provenance
- funnel metrics
- scenario inheritance
- rounding

### Feature tests

Test feature application behavior with repository fakes/adapters.

### UI tests

React Testing Library for focused component behavior.

### E2E

Playwright for:

- product onboarding
- template review
- graph/inspector
- formula editing
- funnel compare
- scenario compare
- persistence/retry
- keyboard/mobile accessibility

## 20. Performance boundaries

For V1, calculations are synchronous in-process unless profiling proves otherwise.

Do not introduce workers prematurely.

If normal models exceed the response budget, the Calculation Engine's pure contract allows moving evaluation to a Web Worker without changing feature/UI semantics.

Target from PRD:

- <=100 ms p95 edit-to-result for <=250 calculation nodes.

## 21. Error model

Core errors are typed domain outcomes, not thrown strings rendered directly to users.

Example categories:

```text
InvalidInput
MissingDependency
UnknownSymbol
FormulaSyntaxError
FormulaCycle
DivisionByZero
CurrencyMismatch
ScenarioCycle
OrphanOverride
```

Feature/application layers translate them into user-facing messages defined by DESIGN.md.

## 22. Repository public API rule

Every feature slice exposes intentional public exports through `index.ts`.

Forbidden:

```text
import { x } from '../features/scenarios/internal/foo'
```

Allowed:

```text
import { x } from '../features/scenarios'
```

Use lint rules/path aliases later to enforce boundaries.

## 23. Naming

Code identifiers: English.

Examples:

```text
CostNode
ScenarioOverride
CalculationResult
PeriodBasis
TrafficSafetyTemplate
```

UI copy: German by default.

Stable domain IDs do not depend on translated labels.

## 24. Architectural review checklist

Before accepting a feature:

- Does the change live mostly inside one vertical slice?
- Is any new shared abstraction needed by at least two real consumers?
- Did industry-specific behavior leak into core?
- Did React/Supabase/React Flow leak into core?
- Are persisted data and visualization data still separate?
- Is direct vs allocated cost provenance preserved?
- Are period and scenario semantics handled in domain logic?
- Are custom formulas still non-executable data?
- Can the domain behavior be tested without browser/backend?
- Did we add framework ceremony that does not serve a product requirement?
