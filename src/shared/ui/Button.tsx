/**
 * Shared button primitive.
 * Location: src/shared/ui/Button.tsx
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[color:var(--accent-analysis)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)]',
  ghost:
    'bg-transparent text-[color:var(--ink-primary)] border border-[color:var(--line-default)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)]',
  danger:
    'bg-[color:var(--semantic-cost)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)]',
}

export function Button({ children, variant = 'primary', className = '', disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
