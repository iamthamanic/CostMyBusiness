/**
 * Primary app chrome with German navigation.
 * Location: src/app/layouts/AppLayout.tsx
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Übersicht', end: true },
  { to: '/businesses', label: 'Unternehmen' },
  { to: '/products', label: 'Produkte' },
  { to: '/scenarios', label: 'Szenarien' },
  { to: '/templates', label: 'Vorlagen' },
  { to: '/glossary', label: 'Glossar' },
  { to: '/auth', label: 'Konto' },
  { to: '/settings', label: 'Einstellungen' },
] as const

export function AppLayout() {
  const location = useLocation()
  const wideWorkbench = /^\/products\/[^/]+/.test(location.pathname)
  const shellMax = wideWorkbench ? 'max-w-[1800px]' : 'max-w-6xl'

  return (
    <div className="min-h-screen bg-[color:var(--surface-canvas)] text-[color:var(--ink-primary)]">
      <header className="border-b border-[color:var(--line-default)] bg-[color:var(--surface-panel)]">
        <div
          className={`mx-auto flex ${shellMax} flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between`}
        >
          <div>
            <p className="text-sm font-semibold tracking-wide text-[color:var(--accent-analysis)]">
              CostMyBusiness
            </p>
            <p className="text-xs text-[color:var(--ink-muted)]">Visueller Produktkalkulator</p>
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
      <div className={`mx-auto ${shellMax} px-4 py-6`}>
        <Outlet />
      </div>
    </div>
  )
}
