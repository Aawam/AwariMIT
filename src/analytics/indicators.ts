export function movingAverage(values: number[], period: number): number | null {
  if (period <= 0 || values.length < period) return null
  return values.slice(-period).reduce((sum, value) => sum + value, 0) / period
}

export function percentageChange(current: number | null, prior: number | null): number | null {
  if (current === null || prior === null || prior === 0) return null
  return ((current - prior) / prior) * 100
}

export function relativeVolume(current: number | null, average: number | null): number | null {
  if (current === null || average === null || average <= 0) return null
  return current / average
}

export function maxDrawdown(values: number[]): number | null {
  if (values.length < 2) return null
  let peak = values[0]
  let worst = 0
  for (const value of values) {
    peak = Math.max(peak, value)
    worst = Math.min(worst, (value - peak) / peak)
  }
  return worst * 100
}
