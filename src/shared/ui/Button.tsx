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
    'bg-[color:var(--ink-primary)] text-white hover:bg-[#243049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] active:scale-[0.98]',
  ghost:
    'bg-transparent text-[color:var(--ink-primary)] border border-[color:var(--line-default)] hover:bg-[color:var(--surface-rail)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] active:scale-[0.98]',
  danger:
    'bg-[color:var(--semantic-cost)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] active:scale-[0.98]',
}

export function Button({ children, variant = 'primary', className = '', disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
