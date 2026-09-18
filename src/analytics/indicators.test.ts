import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { maxDrawdown, movingAverage, percentageChange, relativeVolume } from './indicators'
import { confidenceForCoverage, scoreStock, statusFor } from './screening'
import { bbcaAnnualReference, bbcaH12026Snapshot, bbcaReference, bbcaTechnicalReference } from '../data/marketData'
import type { Stock } from '../domain/types'
// @ts-expect-error The executable refresh boundary is plain Node ESM, exercised here by Vitest.
import { updateFromInput, validateMarketSnapshot } from '../../scripts/refresh-market-snapshot.mjs'

const baseStock: Stock = {
  ticker: 'TEST', name: 'Test Company', sector: 'Test', description: 'Test fixture.',
  price: { value: 120, source: 'test', period: 'test', retrievedAt: '2026-01-01T00:00:00.000Z', unit: 'IDR' },
  dailyChange: 1, averageTradedValue: 10_000_000_000, priceHistory: [100, 105, 110, 120],
  technical: { oneWeek: 2, oneMonth: 4, threeMonth: 10, ma20: 110, ma50: 105 },
  fundamentals: { roe: 15, revenueGrowth: 10, debtToEquity: 0.4, pe: 12 },
}

const validSnapshot = { ticker: 'BBCA', source: 'reviewed test capture', retrievedAt: '2026-09-18T02:46:57.000Z', bars: [{ date: '2026-09-17', open: 8000, high: 8100, low: 7950, close: 8050, volume: 1_000_000 }, { date: '2026-09-18', open: 8050, high: 8150, low: 8000, close: 8100, volume: 1_200_000 }] }

describe('indicators', () => {
  it('calculates an average only with enough observations', () => { expect(movingAverage([1, 2, 3], 2)).toBe(2.5); expect(movingAverage([1, 2], 3)).toBeNull() })
  it('does not turn missing or invalid inputs into zero', () => { expect(percentageChange(null, 1)).toBeNull(); expect(relativeVolume(20, 0)).toBeNull() })
  it('calculates peak-to-trough drawdown', () => { expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(-25) })
})

describe('scoring integrity', () => {
  it('reports complete evidence and high confidence', () => { const result = scoreStock(baseStock); expect(result.score.coverage).toBe(100); expect(result.score.confidence).toBe('HIGH') })
  it('keeps a normalized score but reduces coverage when fundamental and valuation are missing', () => { const result = scoreStock({ ...baseStock, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.total).not.toBeNull(); expect(result.score.coverage).toBe(70); expect(result.score.confidence).toBe('MEDIUM'); expect(result.score.missingFactors).toEqual(['fundamental', 'valuation']) })
  it('uses banking net-profit growth as valid fundamental evidence without requiring industrial metrics', () => { const result = scoreStock({ ...baseStock, fundamentals: { roe: null, netProfitGrowth: 1.8, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.fundamental).not.toBeNull(); expect(result.score.missingFactors).toEqual(['valuation']) })
  it('gates a high score with sparse data as insufficient evidence', () => { const result = scoreStock({ ...baseStock, averageTradedValue: null, priceHistory: [100], technical: { oneWeek: null, oneMonth: null, threeMonth: 20, ma20: null, ma50: null }, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.coverage).toBe(25); expect(result.score.total).toBeGreaterThan(75); expect(result.status).toBe('Insufficient Evidence') })
  it('classifies threshold boundaries transparently', () => { expect(confidenceForCoverage(85)).toBe('HIGH'); expect(confidenceForCoverage(84.99)).toBe('MEDIUM'); expect(confidenceForCoverage(65)).toBe('MEDIUM'); expect(confidenceForCoverage(64.99)).toBe('LIMITED'); expect(confidenceForCoverage(45)).toBe('LIMITED'); expect(confidenceForCoverage(44.99)).toBe('INSUFFICIENT') })
  it('does not produce strong candidate without high confidence', () => { expect(statusFor(90, 'MEDIUM', 80)).toBe('Candidate') })
})

describe('BBCA period-aware snapshots', () => {
  it('retains annual and interim periods with independent provenance', () => {
    expect(bbcaReference.priceHistory).toHaveLength(244)
    expect(bbcaTechnicalReference.ma200.value).toBeCloseTo(6818.125)
    expect(bbcaAnnualReference.periodType).toBe('FY')
    expect(bbcaH12026Snapshot.periodType).toBe('H1')
    expect(bbcaH12026Snapshot.publicationDate).toBe('2026-07-28')
    expect(bbcaH12026Snapshot.sourceQuality).toBe('OFFICIAL_ISSUER')
    expect(bbcaH12026Snapshot.metrics.find(metric => metric.name === 'Net profit growth')?.status).toBe('DERIVED')
    expect(bbcaAnnualReference.sourceUrl).toContain('bca.co.id')
    expect(scoreStock(bbcaReference).score.coverage).toBe(90)
    expect(scoreStock(bbcaReference).score.confidence).toBe('HIGH')
  })
})

describe('market refresh validation', () => {
  it('accepts good newer data and makes an identical rerun unchanged', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'awarimit-refresh-'))
    const input = join(directory, 'input.json'); const output = join(directory, 'bbca.ts')
    await writeFile(input, JSON.stringify(validSnapshot))
    expect((await updateFromInput(input, output)).status).toBe('UPDATED')
    expect((await updateFromInput(input, output)).status).toBe('UNCHANGED')
    expect(await readFile(output, 'utf8')).toContain('bbcaPriceBars')
  })
  it('rejects malformed, empty, older, and unavailable provider input before a write', () => {
    expect(validateMarketSnapshot({ ...validSnapshot, bars: [] })).not.toHaveLength(0)
    expect(validateMarketSnapshot({ ...validSnapshot, bars: [{ ...validSnapshot.bars[0], high: 7900 }] })).not.toHaveLength(0)
    expect(validateMarketSnapshot({ ...validSnapshot, bars: [...validSnapshot.bars].reverse() })).not.toHaveLength(0)
  })
  it('preserves the previous valid output when input cannot be read', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'awarimit-refresh-'))
    const output = join(directory, 'bbca.ts'); await writeFile(output, 'previous valid snapshot')
    const result = await updateFromInput(join(directory, 'missing.json'), output)
    expect(result.status).toBe('FAILED')
    expect(await readFile(output, 'utf8')).toBe('previous valid snapshot')
  })
})
