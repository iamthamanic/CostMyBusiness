/**
 * Primary app chrome with German navigation.
 * Location: src/app/layouts/AppLayout.tsx
 */
import { NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Übersicht', end: true },
  { to: '/businesses', label: 'Unternehmen' },
  { to: '/products', label: 'Produkte' },
  { to: '/scenarios', label: 'Szenarien' },
  { to: '/templates', label: 'Vorlagen' },
  { to: '/glossary', label: 'Glossar' },
  { to: '/settings', label: 'Einstellungen' },
] as const

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[color:var(--surface-canvas)] text-[color:var(--ink-primary)]">
      <header className="border-b border-[color:var(--line-default)] bg-[color:var(--surface-panel)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[color:var(--accent-analysis)]">
              CostMyBusiness
            </p>
            <p className="text-xs text-[color:var(--ink-muted)]">Profitabilitäts-Workbench</p>
          </div>
          <nav aria-label="Hauptnavigation" className="flex flex-wrap gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-[color:var(--accent-analysis)] text-white'
                      : 'text-[color:var(--ink-primary)] hover:bg-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </div>
    </div>
  )
}
