import { describe, expect, it } from 'vitest'
import { getGlossaryTerm, listGlossaryTerms } from '@/features/glossary'

describe('glossary', () => {
  it('loads shipped terms with required fields', () => {
    const terms = listGlossaryTerms()
    expect(terms.length).toBeGreaterThanOrEqual(10)
    const cac = getGlossaryTerm('cac')
    expect(cac).toMatchObject({
      id: 'cac',
      term: 'CAC',
      fullName: 'Customer Acquisition Cost',
    })
    expect(cac?.definition).toBeTruthy()
    expect(cac?.formulaDescription).toBeTruthy()
    expect(cac?.example).toBeTruthy()
  })

  it('returns null for unknown term ids', () => {
    expect(getGlossaryTerm('does-not-exist')).toBeNull()
  })
})
