/**
 * Calculator empty canvas — faint Margin Spine ghost until a product exists.
 * Location: src/app/pages/WorkbenchGhost.tsx
 */
export function WorkbenchGhost() {
  return (
    <div
      className="relative flex min-h-[min(70vh,640px)] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-panel)] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] px-6 py-10"
      data-testid="workbench-empty"
      aria-hidden
    >
      <div className="pointer-events-none flex w-full max-w-3xl flex-col items-center gap-3 opacity-[0.45]">
        <div className="h-16 w-48 rounded-[10px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-rail)]" />
        <div className="h-8 w-px bg-[color:var(--line-strong)]" />
        <svg className="h-10 w-full max-w-xl text-[color:var(--line-strong)]" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M50 0 V12 M50 12 L10 28 V40 M50 12 L30 28 V40 M50 12 L50 40 M50 12 L70 28 V40 M50 12 L90 28 V40" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <div className="grid w-full max-w-xl grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-[10px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-rail)]"
            />
          ))}
        </div>
        <svg className="h-10 w-full max-w-xl text-[color:var(--line-strong)]" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M10 0 V12 L50 28 V40 M30 0 V12 L50 28 M50 0 V40 M70 0 V12 L50 28 M90 0 V12 L50 28" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <div className="flex w-full max-w-xl gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 flex-1 rounded-[10px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-rail)]"
            />
          ))}
        </div>
      </div>
      <p className="relative z-10 mt-8 max-w-sm text-center text-sm text-[color:var(--ink-muted)]">
        Mit + ein Produkt anlegen — der Margin Spine erscheint hier.
      </p>
    </div>
  )
}
