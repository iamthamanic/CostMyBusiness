/**
 * Shared labeled text/number input with unit/basis hint.
 * Location: src/shared/ui/Field.tsx
 */
import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
}

export function Field({ label, hint, error, id, className = '', ...rest }: Props) {
  const fieldId = id ?? rest.name
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-[color:var(--ink-primary)]">{label}</span>
      {hint ? <span className="text-xs text-[color:var(--ink-muted)]">{hint}</span> : null}
      <input
        id={fieldId}
        className={`rounded-md border border-[color:var(--line-default)] bg-white px-3 py-2 text-[color:var(--ink-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] ${className}`}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-[color:var(--semantic-cost)]" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
