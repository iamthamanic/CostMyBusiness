import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/app/App'

describe('App shell', () => {
  it('renders German placeholder branding', () => {
    render(<App />)
    expect(screen.getByText('CostMyBusiness')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Profitabilitäts-Workbench' })).toBeInTheDocument()
  })
})
