/**
 * Primary app chrome — quiet ledger frame around the calculator.
 * Location: src/app/layouts/AppLayout.tsx
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Kalkulator', end: true },
  { to: '/templates', label: 'Vorlagen' },
  { to: '/glossary', label: 'Glossar' },
  { to: '/auth', label: 'Konto' },
] as const

export function AppLayout() {
  const location = useLocation()
  const wideWorkbench =
    location.pathname === '/' || /^\/products\/[^/]+/.test(location.pathname)
  const shellMax = wideWorkbench ? 'max-w-[1800px]' : 'max-w-6xl'

  return (
    <div className="min-h-[100dvh] text-[color:var(--ink-primary)]">
      <header className="sticky top-0 z-20 border-b border-[color:var(--line-default)] bg-[color:var(--surface-panel)]/95 backdrop-blur-sm">
        <div
          className={`mx-auto flex h-14 ${shellMax} items-center justify-between gap-4 px-4`}
        >
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-[color:var(--ink-primary)]">
              CostMyBusiness
            </p>
            <p className="hidden text-[11px] leading-none text-[color:var(--ink-muted)] sm:block">
              Margin Spine
            </p>
          </div>
          <nav aria-label="Hauptnavigation" className="flex flex-nowrap items-center gap-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `rounded-[var(--radius-control)] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[color:var(--ink-primary)] text-white'
                      : 'text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-rail)] hover:text-[color:var(--ink-primary)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div className={`mx-auto ${shellMax} px-3 py-3 md:px-4 md:py-4`}>
        <Outlet />
      </div>
    </div>
  )
}
