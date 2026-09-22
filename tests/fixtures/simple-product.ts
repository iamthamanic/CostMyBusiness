import type { DomainModel } from '@/core/model'

/** Minimal product fixture: revenue → ops cost → contribution */
export const simpleProductFixture: DomainModel = {
  id: 'model-simple-1',
  version: 1,
  volume: 100,
  nodes: [
    {
      id: 'n-revenue',
      kind: 'revenue',
      key: 'revenue',
      label: 'Umsatz',
      enabled: true,
      inputs: { price: 50 },
    },
    {
      id: 'n-ops',
      kind: 'cost',
      key: 'ops_labor',
      label: 'Betrieb Personal',
      enabled: true,
      costBehavior: 'per_hour',
      inputs: { rate: 40, hoursPerOrder: 0.5 },
      allocation: { rule: 'direct' },
    },
    {
      id: 'n-contribution',
      kind: 'result',
      key: 'contribution',
      label: 'Deckungsbeitrag',
      enabled: true,
      inputs: {},
    },
  ],
  edges: [
    {
      id: 'e1',
      sourceNodeId: 'n-revenue',
      targetNodeId: 'n-contribution',
      relation: 'feeds',
    },
    {
      id: 'e2',
      sourceNodeId: 'n-ops',
      targetNodeId: 'n-contribution',
      relation: 'feeds',
    },
  ],
}
