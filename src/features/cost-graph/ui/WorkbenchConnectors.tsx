/**
 * Decorative SVG connectors for the product calculator flow (not calculation edges).
 * Location: src/features/cost-graph/ui/WorkbenchConnectors.tsx
 */

type FanProps = {
  /** Number of department columns to fan to/from (default 5). */
  branches?: number
  direction: 'down' | 'up'
}

/**
 * Percentage-based fan: one trunk splits into N branches (or merges).
 * Pure presentation — independent of DomainModel.edges.
 */
export function WorkbenchFanConnector({ branches = 5, direction }: FanProps) {
  const mid = 50
  const topY = direction === 'down' ? 0 : 100
  const botY = direction === 'down' ? 100 : 0
  const trunkEnd = direction === 'down' ? 28 : 72
  const spreadY = direction === 'down' ? 55 : 45

  const xs: number[] = []
  for (let i = 0; i < branches; i++) {
    xs.push(((i + 0.5) / branches) * 100)
  }

  return (
    <svg
      className="pointer-events-none h-14 w-full text-[color:var(--line-default)]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      data-testid={`connector-fan-${direction}`}
    >
      <path
        d={`M ${mid} ${topY} L ${mid} ${trunkEnd}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path
        d={`M ${xs[0]} ${spreadY} L ${xs[branches - 1]} ${spreadY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      {xs.map((x) => (
        <path
          key={x}
          d={
            direction === 'down'
              ? `M ${mid} ${trunkEnd} L ${x} ${spreadY} L ${x} ${botY}`
              : `M ${x} ${botY} L ${x} ${spreadY} L ${mid} ${trunkEnd}`
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="0.55"
        />
      ))}
    </svg>
  )
}

export function WorkbenchStemConnector() {
  return (
    <div
      className="mx-auto h-6 w-px bg-[color:var(--line-default)]"
      aria-hidden
      data-testid="connector-stem"
    />
  )
}
