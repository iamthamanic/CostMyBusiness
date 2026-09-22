/**
 * Glossary list page — German UI.
 * Location: src/features/glossary/ui/GlossaryPage.tsx
 */
import { listGlossaryTerms } from '../application/glossary'

export function GlossaryPage() {
  const terms = listGlossaryTerms()
  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Glossar</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Definitionen, Formeln und Beispiele zu den wichtigsten Kennzahlen.
        </p>
      </header>
      <ul className="divide-y divide-[color:var(--line-default)] rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)]">
        {terms.map((term) => (
          <li key={term.id} className="px-4 py-3">
            <p className="font-medium">
              {term.term}{' '}
              <span className="text-sm font-normal text-[color:var(--ink-muted)]">
                ({term.fullName})
              </span>
            </p>
            <p className="text-sm text-[color:var(--ink-muted)]">{term.shortDefinition}</p>
            <p className="mt-1 text-sm">{term.definition}</p>
            {term.formulaDescription ? (
              <p className="mt-1 text-xs">Formel: {term.formulaDescription}</p>
            ) : null}
            {term.example ? (
              <p className="text-xs text-[color:var(--ink-muted)]">Beispiel: {term.example}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
