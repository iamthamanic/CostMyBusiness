/**
 * Overview landing — German entry point.
 * Location: src/app/pages/OverviewPage.tsx
 */
import { Link } from 'react-router-dom'

export function OverviewPage() {
  return (
    <section className="flex flex-col gap-4 rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-6">
      <h1 className="text-2xl font-semibold">Übersicht</h1>
      <p className="max-w-2xl text-[color:var(--ink-muted)]">
        Modellieren Sie die Profitabilität Ihrer Produkte. Legen Sie zuerst ein Unternehmen an und
        öffnen Sie anschließend ein Produkt.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/businesses"
          className="rounded-md bg-[color:var(--accent-analysis)] px-3 py-2 text-sm font-medium text-white"
        >
          Zu den Unternehmen
        </Link>
        <Link
          to="/products"
          className="rounded-md border border-[color:var(--line-default)] px-3 py-2 text-sm font-medium"
        >
          Zu den Produkten
        </Link>
      </div>
    </section>
  )
}
