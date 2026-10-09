/**
 * Embed mount for Business Ultra shell (no iframe).
 * Location: src/embed.tsx
 * Exposes window.mountCostMyBusiness / unmountCostMyBusiness.
 */
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { OverviewPage } from '@/app/pages/OverviewPage'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { ReposProvider } from '@/app/providers/ReposProvider'
import { GlossaryPage } from '@/features/glossary'
import { TemplatesPage } from '@/features/templates'
import './index.css'

export type MountOptions = {
  theme?: 'business-ultra' | 'default'
}

const nav = [
  { to: '/', label: 'Kalkulator', end: true },
  { to: '/templates', label: 'Vorlagen' },
  { to: '/glossary', label: 'Glossar' },
] as const

let root: Root | null = null
let mountedEl: HTMLElement | null = null

function EmbedShell({ theme }: { theme: MountOptions['theme'] }) {
  const themeClass = theme === 'business-ultra' ? 'cmb-theme-bu' : ''
  return (
    <div
      className={`cmb-embed min-h-full text-[color:var(--ink-primary)] ${themeClass}`}
      data-cmb-embed="1"
      data-theme={theme ?? 'default'}
    >
      <div className="sticky top-0 z-20 border-b border-[color:var(--line-default)] bg-[color:var(--surface-panel)]/95 px-3 py-2 backdrop-blur-sm">
        <nav aria-label="CostMyBusiness" className="flex flex-nowrap items-center gap-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `rounded-[var(--radius-control)] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[color:var(--accent-analysis)] text-white'
                    : 'text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-rail)] hover:text-[color:var(--ink-primary)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1800px] px-3 py-3 md:px-4 md:py-4">
        <Routes>
          <Route index element={<OverviewPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export function mountCostMyBusiness(el: HTMLElement, opts: MountOptions = {}) {
  if (root && mountedEl === el) return
  unmountCostMyBusiness()
  mountedEl = el
  el.classList.add('cmb-root')
  if (opts.theme === 'business-ultra') el.classList.add('cmb-theme-bu')
  root = createRoot(el)
  root.render(
    <AuthProvider>
      <ReposProvider>
        <MemoryRouter initialEntries={['/']}>
          <EmbedShell theme={opts.theme ?? 'business-ultra'} />
        </MemoryRouter>
      </ReposProvider>
    </AuthProvider>,
  )
}

export function unmountCostMyBusiness() {
  if (root) {
    root.unmount()
    root = null
  }
  if (mountedEl) {
    mountedEl.classList.remove('cmb-root', 'cmb-theme-bu')
    mountedEl = null
  }
}

declare global {
  interface Window {
    mountCostMyBusiness: typeof mountCostMyBusiness
    unmountCostMyBusiness: typeof unmountCostMyBusiness
  }
}

window.mountCostMyBusiness = mountCostMyBusiness
window.unmountCostMyBusiness = unmountCostMyBusiness
