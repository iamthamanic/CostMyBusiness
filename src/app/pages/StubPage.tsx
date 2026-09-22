/**
 * Placeholder routes for later slices.
 * Location: src/app/pages/StubPage.tsx
 */
export function StubPage({ title }: { title: string }) {
  return (
    <section className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-[color:var(--ink-muted)]">Dieser Bereich folgt in einer späteren Ausbaustufe.</p>
    </section>
  )
}
