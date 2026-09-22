import { describe, expect, it } from 'vitest'
import {
  FormulaError,
  createFormula,
  evaluateFormula,
  parseFormula,
  resetToDefault,
  runFormula,
} from '@/core/formulas'

describe('formula engine', () => {
  it('evaluates allowed operators and functions', () => {
    const mixed = runFormula('SUM(1, 2, 3) * ROUND(1.26, 1)', {})
    expect(mixed.status).toBe('ok')
    if (mixed.status === 'ok') {
      expect(mixed.value).toBeCloseTo(7.8, 10)
    }
    expect(runFormula('IF(1, 10, 20)', {})).toEqual({ status: 'ok', value: 10 })
    expect(runFormula('price * qty', { price: 5, qty: 4 })).toEqual({
      status: 'ok',
      value: 20,
    })
  })

  it('rejects unsafe executable syntax', () => {
    const unsafe = ['alert(1)', 'window.x', 'eval(1)', '`hi`', 'import(x)', 'foo;bar']
    for (const expression of unsafe) {
      expect(() => parseFormula(expression)).toThrow(FormulaError)
    }
    expect(() => parseFormula('evilFn(1)')).toThrow(FormulaError)
  })

  it('returns unresolved for divide-by-zero and unknown symbols', () => {
    expect(runFormula('1 / 0', {})).toMatchObject({
      status: 'unresolved',
      reason: 'divide_by_zero',
    })
    expect(runFormula('missing + 1', {})).toMatchObject({
      status: 'unresolved',
      reason: 'unknown_symbol',
    })
  })

  it('supports custom vs default source and reset', () => {
    const custom = createFormula('a + 1', 'custom')
    expect(custom.source).toBe('custom')
    const restored = resetToDefault('a + 0')
    expect(restored.source).toBe('default')
    expect(evaluateFormula(restored.ast, { a: 2 })).toEqual({ status: 'ok', value: 2 })
  })

  it('does not use eval or Function constructors in module source', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const dir = path.resolve('src/core/formulas')
    const files = fs.readdirSync(dir)
    const joined = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n')
    expect(joined).not.toMatch(/\beval\s*\(/)
    expect(joined).not.toMatch(/new\s+Function\b/)
  })
})
