/**
 * Restricted formula AST types — no executable JavaScript.
 * Location: src/core/formulas/ast.ts
 */

export type FormulaSource = 'default' | 'custom'

export type AstNode =
  | { type: 'number'; value: number }
  | { type: 'ref'; name: string }
  | { type: 'unary'; op: '-'; argument: AstNode }
  | { type: 'binary'; op: '+' | '-' | '*' | '/' | '%'; left: AstNode; right: AstNode }
  | {
      type: 'call'
      name: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'ROUND' | 'IF'
      args: AstNode[]
    }

export type FormulaDocument = {
  expression: string
  source: FormulaSource
  ast: AstNode
}

export type FormulaErrorCode =
  | 'syntax'
  | 'unknown_symbol'
  | 'unknown_function'
  | 'arity'
  | 'unsafe'
  | 'cycle'
  | 'divide_by_zero'

export class FormulaError extends Error {
  readonly code: FormulaErrorCode

  constructor(code: FormulaErrorCode, message: string) {
    super(message)
    this.name = 'FormulaError'
    this.code = code
  }
}
