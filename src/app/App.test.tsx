import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/app/App'

describe('App shell', () => {
  it('renders German overview branding and nav', () => {
    render(<App />)
    expect(screen.getAllByText('CostMyBusiness').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Übersicht' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument()
  })
})
