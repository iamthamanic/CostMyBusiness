import { describe, expect, it } from 'vitest'
import { CycleError, evaluate, topologicalOrder } from '@/core/calculation'
import type { DomainModel } from '@/core/model'
import { simpleProductFixture } from '../fixtures/simple-product'

describe('calculation engine', () => {
  it('evaluates per-unit and period totals from fixture', () => {
    const result = evaluate(simpleProductFixture)
    const contribution = result.results['n-contribution']
    expect(contribution.value.status).toBe('ok')
    if (contribution.value.status !== 'ok') return
    // price 50 - (40 * 0.5) = 30 per unit; * 100 = 3000 period
    expect(contribution.value.perUnit).toBe(30)
    expect(contribution.value.periodTotal).toBe(3000)
    expect(contribution.provenance.allocationRule).toBe('none')
    expect(result.results['n-ops']?.provenance.allocationRule).toBe('direct')
  })

  it('rejects cyclic graphs', () => {
    const cyclic: DomainModel = {
      id: 'cycle',
      version: 1,
      volume: 1,
      nodes: [
        { id: 'a', kind: 'metric', key: 'a', label: 'A', enabled: true, inputs: {} },
        { id: 'b', kind: 'metric', key: 'b', label: 'B', enabled: true, inputs: {} },
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'a', targetNodeId: 'b', relation: 'depends_on' },
        { id: 'e2', sourceNodeId: 'b', targetNodeId: 'a', relation: 'depends_on' },
      ],
    }
    expect(() => topologicalOrder(cyclic)).toThrow(CycleError)
  })

  it('returns unresolved instead of NaN when inputs missing', () => {
    const model: DomainModel = {
      ...simpleProductFixture,
      nodes: simpleProductFixture.nodes.map((n) =>
        n.id === 'n-ops' ? { ...n, inputs: {} } : n,
      ),
    }
    const result = evaluate(model)
    const ops = result.results['n-ops']
    expect(ops.value.status).toBe('unresolved')
    if (ops.value.status === 'unresolved') {
      expect(ops.value.reason).toBe('missing_input')
    }
    const contribution = result.results['n-contribution']
    expect(contribution.value.status).toBe('unresolved')
  })
})
