/**
 * Safe AST evaluator — never executes JavaScript from user input.
 * Location: src/core/formulas/evaluate.ts
 */
import { FormulaError, type AstNode } from './ast'

export type FormulaScope = Record<string, number>

export type FormulaEvalResult =
  | { status: 'ok'; value: number }
  | { status: 'unresolved'; reason: 'divide_by_zero' | 'unknown_symbol'; message: string }

function evalAst(node: AstNode, scope: FormulaScope, stack: Set<string>): FormulaEvalResult {
  switch (node.type) {
    case 'number':
      return { status: 'ok', value: node.value }
    case 'ref': {
      if (stack.has(node.name)) {
        throw new FormulaError('cycle', `Cyclic formula reference: ${node.name}`)
      }
      if (!(node.name in scope)) {
        return {
          status: 'unresolved',
          reason: 'unknown_symbol',
          message: `Unknown symbol: ${node.name}`,
        }
      }
      const value = scope[node.name]
      if (value === undefined || !Number.isFinite(value)) {
        return {
          status: 'unresolved',
          reason: 'unknown_symbol',
          message: `Unknown symbol: ${node.name}`,
        }
      }
      return { status: 'ok', value }
    }
    case 'unary': {
      const arg = evalAst(node.argument, scope, stack)
      if (arg.status !== 'ok') return arg
      return { status: 'ok', value: -arg.value }
    }
    case 'binary': {
      const left = evalAst(node.left, scope, stack)
      if (left.status !== 'ok') return left
      const right = evalAst(node.right, scope, stack)
      if (right.status !== 'ok') return right
      if ((node.op === '/' || node.op === '%') && right.value === 0) {
        return {
          status: 'unresolved',
          reason: 'divide_by_zero',
          message: 'Division by zero',
        }
      }
      switch (node.op) {
        case '+':
          return { status: 'ok', value: left.value + right.value }
        case '-':
          return { status: 'ok', value: left.value - right.value }
        case '*':
          return { status: 'ok', value: left.value * right.value }
        case '/':
          return { status: 'ok', value: left.value / right.value }
        case '%':
          return { status: 'ok', value: left.value % right.value }
      }
      break
    }
    case 'call': {
      if (node.name === 'IF') {
        const condition = evalAst(node.args[0]!, scope, stack)
        if (condition.status !== 'ok') return condition
        const branch = condition.value !== 0 ? node.args[1]! : node.args[2]!
        return evalAst(branch, scope, stack)
      }

      const values: number[] = []
      for (const arg of node.args) {
        const evaluated = evalAst(arg, scope, stack)
        if (evaluated.status !== 'ok') return evaluated
        values.push(evaluated.value)
      }

      switch (node.name) {
        case 'SUM':
          return { status: 'ok', value: values.reduce((a, b) => a + b, 0) }
        case 'AVG':
          return { status: 'ok', value: values.reduce((a, b) => a + b, 0) / values.length }
        case 'MIN':
          return { status: 'ok', value: Math.min(...values) }
        case 'MAX':
          return { status: 'ok', value: Math.max(...values) }
        case 'ROUND': {
          const digits = values[1] ?? 0
          const factor = 10 ** digits
          return { status: 'ok', value: Math.round(values[0]! * factor) / factor }
        }
      }
    }
  }
  throw new FormulaError('syntax', 'Unreachable AST node')
}

export function evaluateFormula(ast: AstNode, scope: FormulaScope): FormulaEvalResult {
  return evalAst(ast, scope, new Set())
}

export function extractRefs(ast: AstNode): string[] {
  const refs = new Set<string>()
  const walk = (node: AstNode): void => {
    switch (node.type) {
      case 'ref':
        refs.add(node.name)
        break
      case 'unary':
        walk(node.argument)
        break
      case 'binary':
        walk(node.left)
        walk(node.right)
        break
      case 'call':
        for (const arg of node.args) walk(arg)
        break
      default:
        break
    }
  }
  walk(ast)
  return [...refs]
}
