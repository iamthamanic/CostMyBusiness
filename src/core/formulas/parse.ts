/**
 * Recursive-descent parser for the restricted formula language.
 * Location: src/core/formulas/parse.ts
 */
import { FormulaError, type AstNode, type FormulaDocument, type FormulaSource } from './ast'
import { tokenize, type Token } from './tokenize'

const FUNCTIONS = new Set(['SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'IF'])
type FnName = 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'ROUND' | 'IF'

function isOp(token: Token, value: string): boolean {
  return token.kind === 'op' && token.value === value
}

class Parser {
  private pos = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): AstNode {
    const node = this.parseExpr()
    if (this.peek().kind !== 'eof') {
      throw new FormulaError('syntax', 'Unexpected trailing tokens')
    }
    return node
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { kind: 'eof' }
  }

  private consume(): Token {
    const token = this.peek()
    this.pos += 1
    return token
  }

  private parseExpr(): AstNode {
    let left = this.parseTerm()
    while (isOp(this.peek(), '+') || isOp(this.peek(), '-')) {
      const opToken = this.consume()
      if (opToken.kind !== 'op' || (opToken.value !== '+' && opToken.value !== '-')) {
        throw new FormulaError('syntax', 'Expected + or -')
      }
      const right = this.parseTerm()
      left = { type: 'binary', op: opToken.value, left, right }
    }
    return left
  }

  private parseTerm(): AstNode {
    let left = this.parseUnary()
    while (isOp(this.peek(), '*') || isOp(this.peek(), '/') || isOp(this.peek(), '%')) {
      const opToken = this.consume()
      if (
        opToken.kind !== 'op' ||
        (opToken.value !== '*' && opToken.value !== '/' && opToken.value !== '%')
      ) {
        throw new FormulaError('syntax', 'Expected * / or %')
      }
      const right = this.parseUnary()
      left = { type: 'binary', op: opToken.value, left, right }
    }
    return left
  }

  private parseUnary(): AstNode {
    if (isOp(this.peek(), '-')) {
      this.consume()
      return { type: 'unary', op: '-', argument: this.parseUnary() }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): AstNode {
    const token = this.peek()

    if (token.kind === 'number') {
      this.consume()
      return { type: 'number', value: token.value }
    }

    if (token.kind === 'ident') {
      this.consume()
      if (isOp(this.peek(), '(')) {
        return this.parseCall(token.value)
      }
      return { type: 'ref', name: token.value }
    }

    if (isOp(token, '(')) {
      this.consume()
      const inner = this.parseExpr()
      if (!isOp(this.consume(), ')')) {
        throw new FormulaError('syntax', 'Expected closing parenthesis')
      }
      return inner
    }

    throw new FormulaError('syntax', 'Expected expression')
  }

  private parseCall(name: string): AstNode {
    if (!FUNCTIONS.has(name)) {
      throw new FormulaError('unknown_function', `Function not allowed: ${name}`)
    }
    this.consume() // (
    const args: AstNode[] = []
    if (!isOp(this.peek(), ')')) {
      args.push(this.parseExpr())
      while (isOp(this.peek(), ',')) {
        this.consume()
        args.push(this.parseExpr())
      }
    }
    if (!isOp(this.consume(), ')')) {
      throw new FormulaError('syntax', 'Expected closing parenthesis after call')
    }

    this.assertArity(name as FnName, args.length)
    return { type: 'call', name: name as FnName, args }
  }

  private assertArity(name: FnName, count: number): void {
    const rules: Record<FnName, (n: number) => boolean> = {
      SUM: (n) => n >= 1,
      AVG: (n) => n >= 1,
      MIN: (n) => n >= 1,
      MAX: (n) => n >= 1,
      ROUND: (n) => n === 1 || n === 2,
      IF: (n) => n === 3,
    }
    if (!rules[name](count)) {
      throw new FormulaError('arity', `Wrong arity for ${name}: ${count}`)
    }
  }
}

const UNSAFE_PATTERNS = [
  /`/,
  /\beval\b/i,
  /\bFunction\b/,
  /\bwindow\b/i,
  /\bglobalThis\b/i,
  /\bimport\b/i,
  /\brequire\b/i,
  /\balert\b/i,
  /\bprocess\b/i,
  /;/,
  /\{/,
  /\}/,
]

export function assertSafeFormulaText(expression: string): void {
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(expression)) {
      throw new FormulaError('unsafe', 'Formula contains unsupported executable syntax')
    }
  }
}

export function parseFormula(
  expression: string,
  source: FormulaSource = 'custom',
): FormulaDocument {
  assertSafeFormulaText(expression)
  const tokens = tokenize(expression)
  const ast = new Parser(tokens).parse()
  return { expression, source, ast }
}
