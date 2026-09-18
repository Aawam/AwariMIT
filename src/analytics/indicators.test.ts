import { describe, expect, it } from 'vitest'
import { maxDrawdown, movingAverage, percentageChange, relativeVolume } from './indicators'
import { confidenceForCoverage, scoreStock, statusFor } from './screening'
import { bbcaFundamentalReference, bbcaReference, bbcaTechnicalReference } from '../data/marketData'
import type { Stock } from '../domain/types'

const baseStock: Stock = {
  ticker: 'TEST', name: 'Test Company', sector: 'Test', description: 'Test fixture.',
  price: { value: 120, source: 'test', period: 'test', retrievedAt: '2026-01-01T00:00:00.000Z', unit: 'IDR' },
  dailyChange: 1, averageTradedValue: 10_000_000_000, priceHistory: [100, 105, 110, 120],
  technical: { oneWeek: 2, oneMonth: 4, threeMonth: 10, ma20: 110, ma50: 105 },
  fundamentals: { roe: 15, revenueGrowth: 10, debtToEquity: 0.4, pe: 12 },
}

describe('indicators', () => {
  it('calculates an average only with enough observations', () => { expect(movingAverage([1, 2, 3], 2)).toBe(2.5); expect(movingAverage([1, 2], 3)).toBeNull() })
  it('does not turn missing or invalid inputs into zero', () => { expect(percentageChange(null, 1)).toBeNull(); expect(relativeVolume(20, 0)).toBeNull() })
  it('calculates peak-to-trough drawdown', () => { expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(-25) })
})

describe('scoring integrity', () => {
  it('reports complete evidence and high confidence', () => { const result = scoreStock(baseStock); expect(result.score.coverage).toBe(100); expect(result.score.confidence).toBe('HIGH') })
  it('keeps a normalized score but reduces coverage when fundamental and valuation are missing', () => { const result = scoreStock({ ...baseStock, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.total).not.toBeNull(); expect(result.score.coverage).toBe(70); expect(result.score.confidence).toBe('MEDIUM'); expect(result.score.missingFactors).toEqual(['fundamental', 'valuation']) })
  it('gates a high score with sparse data as insufficient evidence', () => { const result = scoreStock({ ...baseStock, averageTradedValue: null, priceHistory: [100], technical: { oneWeek: null, oneMonth: null, threeMonth: 20, ma20: null, ma50: null }, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.coverage).toBe(25); expect(result.score.total).toBeGreaterThan(75); expect(result.status).toBe('Insufficient Evidence') })
  it('classifies threshold boundaries transparently', () => { expect(confidenceForCoverage(85)).toBe('HIGH'); expect(confidenceForCoverage(84.99)).toBe('MEDIUM'); expect(confidenceForCoverage(65)).toBe('MEDIUM'); expect(confidenceForCoverage(64.99)).toBe('LIMITED'); expect(confidenceForCoverage(45)).toBe('LIMITED'); expect(confidenceForCoverage(44.99)).toBe('INSUFFICIENT') })
  it('does not produce strong candidate without high confidence', () => { expect(statusFor(90, 'MEDIUM', 80)).toBe('Candidate') })
})

describe('BBCA reference snapshot', () => {
  it('retains a one-year price history and traceable issuer fundamentals', () => {
    expect(bbcaReference.priceHistory).toHaveLength(244)
    expect(bbcaTechnicalReference.ma200.value).toBeCloseTo(6818.125)
    expect(bbcaFundamentalReference.netIncome.value).toBe(57_563)
    expect(bbcaFundamentalReference.sourceUrl).toContain('bca.co.id')
  })
})
