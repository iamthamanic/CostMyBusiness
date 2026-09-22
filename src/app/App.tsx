/**
 * App shell — composition root for CostMyBusiness.
 * Location: src/app/App.tsx
 * Purpose: German placeholder landing until product features ship.
 */
export function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-[color:var(--accent-analysis)]">
        CostMyBusiness
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--ink-primary)]">
        Profitabilitäts-Workbench
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-[color:var(--ink-muted)]">
        Die Anwendung startet. Produktfunktionen werden schrittweise über die Issue-Queue
        ausgeliefert.
      </p>
    </main>
  )
}
