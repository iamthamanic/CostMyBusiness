/**
 * Shared-cost allocation strategies with provenance.
 * Location: src/core/allocation/allocate.ts
 */

export type AllocationStrategy =
  | 'per_unit'
  | 'per_order'
  | 'per_customer'
  | 'per_fte'
  | 'per_hour'
  | 'percentage'
  | 'custom_driver'

export type AllocationInput = {
  poolAmount: number
  strategy: AllocationStrategy
  sourcePoolId: string
  /** Driver quantity in the target period (units, orders, hours, …). */
  driverQuantity?: number
  /** 0–100 when strategy is percentage. */
  percentage?: number
}

export type AllocationResult =
  | {
      status: 'ok'
      allocatedAmount: number
      provenance: {
        sourcePoolId: string
        strategy: AllocationStrategy
        rule: 'allocated'
      }
    }
  | {
      status: 'unresolved'
      reason: 'missing_driver' | 'zero_driver' | 'invalid_percentage'
      message: string
      provenance: {
        sourcePoolId: string
        strategy: AllocationStrategy
        rule: 'allocated'
      }
    }

export function allocate(input: AllocationInput): AllocationResult {
  const baseProvenance = {
    sourcePoolId: input.sourcePoolId,
    strategy: input.strategy,
    rule: 'allocated' as const,
  }

  if (input.strategy === 'percentage') {
    if (input.percentage === undefined || input.percentage < 0 || input.percentage > 100) {
      return {
        status: 'unresolved',
        reason: 'invalid_percentage',
        message: 'Percentage allocation requires percentage between 0 and 100',
        provenance: baseProvenance,
      }
    }
    return {
      status: 'ok',
      allocatedAmount: (input.poolAmount * input.percentage) / 100,
      provenance: baseProvenance,
    }
  }

  if (input.driverQuantity === undefined) {
    return {
      status: 'unresolved',
      reason: 'missing_driver',
      message: `Allocation strategy ${input.strategy} requires driverQuantity`,
      provenance: baseProvenance,
    }
  }

  if (input.driverQuantity === 0) {
    return {
      status: 'unresolved',
      reason: 'zero_driver',
      message: 'Allocation driver quantity is zero',
      provenance: baseProvenance,
    }
  }

  return {
    status: 'ok',
    allocatedAmount: input.poolAmount / input.driverQuantity,
    provenance: baseProvenance,
  }
}

export type BreakEvenInput = {
  fixedCost: number
  contributionPerUnit: number
}

export type BreakEvenResult =
  | {
      status: 'ok'
      units: number
      formula: string
      inputs: BreakEvenInput
    }
  | {
      status: 'unresolved'
      message: string
      inputs: BreakEvenInput
    }

export function breakEvenUnits(input: BreakEvenInput): BreakEvenResult {
  if (!Number.isFinite(input.fixedCost) || !Number.isFinite(input.contributionPerUnit)) {
    return { status: 'unresolved', message: 'Break-even inputs must be finite', inputs: input }
  }
  if (input.contributionPerUnit <= 0) {
    return {
      status: 'unresolved',
      message: 'Break-even requires positive contribution per unit',
      inputs: input,
    }
  }
  return {
    status: 'ok',
    units: input.fixedCost / input.contributionPerUnit,
    formula: 'fixedCost / contributionPerUnit',
    inputs: input,
  }
}

/** Keep direct and allocated totals separately inspectable. */
export type CostBreakdown = {
  direct: number
  allocated: number
  fullyLoaded: number
}

export function combineDirectAndAllocated(direct: number, allocated: number): CostBreakdown {
  return {
    direct,
    allocated,
    fullyLoaded: direct + allocated,
  }
}
