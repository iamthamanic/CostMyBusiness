/**
 * Tokenizer for the restricted formula language.
 * Location: src/core/formulas/tokenize.ts
 */
import { FormulaError } from './ast'

export type Token =
  | { kind: 'number'; value: number }
  | { kind: 'ident'; value: string }
  | { kind: 'op'; value: '+' | '-' | '*' | '/' | '%' | '(' | ')' | ',' }
  | { kind: 'eof' }

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const src = input

  while (i < src.length) {
    const ch = src[i]
    if (ch === undefined) break

    if (/\s/.test(ch)) {
      i += 1
      continue
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%' || ch === '(' || ch === ')' || ch === ',') {
      tokens.push({ kind: 'op', value: ch })
      i += 1
      continue
    }

    if (/[0-9.]/.test(ch)) {
      let j = i + 1
      while (j < src.length && /[0-9.]/.test(src[j] ?? '')) j += 1
      const raw = src.slice(i, j)
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throw new FormulaError('syntax', `Invalid number: ${raw}`)
      }
      tokens.push({ kind: 'number', value })
      i = j
      continue
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j] ?? '')) j += 1
      tokens.push({ kind: 'ident', value: src.slice(i, j) })
      i = j
      continue
    }

    throw new FormulaError('unsafe', `Unsupported character: ${ch}`)
  }

  tokens.push({ kind: 'eof' })
  return tokens
}
