/**
 * Formula engine public API — parse, evaluate, reset-to-default helpers.
 * Location: src/core/formulas/index.ts
 */
import type { FormulaDocument, FormulaSource } from './ast'
import { evaluateFormula, extractRefs, type FormulaEvalResult, type FormulaScope } from './evaluate'
import { parseFormula } from './parse'

export * from './ast'
export { evaluateFormula, extractRefs, parseFormula }
export type { FormulaEvalResult, FormulaScope }

export function createFormula(expression: string, source: FormulaSource = 'custom'): FormulaDocument {
  return parseFormula(expression, source)
}

export function resetToDefault(defaultExpression: string): FormulaDocument {
  return parseFormula(defaultExpression, 'default')
}

export function runFormula(expression: string, scope: FormulaScope): FormulaEvalResult {
  const doc = parseFormula(expression, 'custom')
  return evaluateFormula(doc.ast, scope)
}
