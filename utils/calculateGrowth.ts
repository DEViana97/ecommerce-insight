export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 1 : 0;
  }

  return (current - previous) / previous;
}

export function calculateGrowthPercent(current: number, previous: number): number {
  return calculateGrowth(current, previous) * 100;
}
