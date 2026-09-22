/**
 * Contextual glossary help — keyboard, hover, and tap accessible (not hover-only).
 * Location: src/features/glossary/ui/GlossaryHelp.tsx
 */
import { useEffect, useId, useRef, useState } from 'react'
import { getGlossaryTerm } from '../application/glossary'

type Props = {
  termId: string
}

export function GlossaryHelp({ termId }: Props) {
  const term = getGlossaryTerm(termId)
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!term) return null

  return (
    <span ref={rootRef} className="relative inline-flex align-middle">
      <button
        type="button"
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--line-default)] text-xs text-[color:var(--ink-muted)] hover:border-[color:var(--accent-analysis)] hover:text-[color:var(--accent-analysis)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)]"
        aria-label={`Hilfe zu ${term.term}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
      >
        ?
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={term.fullName}
          className="absolute left-0 top-7 z-20 w-72 rounded-[10px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-3 text-left shadow-md"
        >
          <p className="text-sm font-semibold text-[color:var(--ink-primary)]">
            {term.term} — {term.fullName}
          </p>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">{term.definition}</p>
          {term.formulaDescription ? (
            <p className="mt-2 text-xs text-[color:var(--ink-primary)]">
              <span className="font-medium">Formel:</span> {term.formulaDescription}
            </p>
          ) : null}
          {term.example ? (
            <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
              <span className="font-medium text-[color:var(--ink-primary)]">Beispiel:</span>{' '}
              {term.example}
            </p>
          ) : null}
        </div>
      ) : null}
    </span>
  )
}
