import { describe, expect, it } from 'vitest'
import { maxDrawdown, movingAverage, percentageChange, relativeVolume } from './indicators'
import { rankStocks } from './screening'
import { stocks } from '../data/marketData'

describe('indicators', () => {
  it('calculates an average only with enough observations', () => {
    expect(movingAverage([1, 2, 3], 2)).toBe(2.5)
    expect(movingAverage([1, 2], 3)).toBeNull()
  })
  it('does not turn missing or invalid inputs into zero', () => {
    expect(percentageChange(null, 1)).toBeNull()
    expect(relativeVolume(20, 0)).toBeNull()
  })
  it('calculates peak-to-trough drawdown', () => {
    expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(-25)
  })
})

describe('screening', () => {
  it('ranks deterministically and retains missing fundamental fields', () => {
    const ranked = rankStocks(stocks)
    expect(ranked).toHaveLength(stocks.length)
    expect(ranked[0].score.total).toBeGreaterThanOrEqual(ranked[1].score.total ?? 0)
    expect(ranked.find(stock => stock.ticker === 'BMRI')?.fundamentals.roe).toBeNull()
  })
})
