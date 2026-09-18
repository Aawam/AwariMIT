import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { maxDrawdown, movingAverage, percentageChange, relativeVolume } from './indicators'
import { calculateRiskAssessment, confidenceForCoverage, riskLevelFor, scoreStock, statusFor } from './screening'
import { availableFundamentalEvidence, businessProfiles } from '../config/businessProfiles'
import { bbcaAnnualReference, bbcaH12026Snapshot, bbcaReference, bbcaTechnicalReference } from '../data/marketData'
import type { Stock } from '../domain/types'
// @ts-expect-error The executable refresh boundary is plain Node ESM, exercised here by Vitest.
import { updateFromInput, validateMarketSnapshot } from '../../scripts/refresh-market-snapshot.mjs'

const baseStock: Stock = {
  ticker: 'TEST', name: 'Test Company', sector: 'Test', profile: 'BANKING', description: 'Test fixture.',
  price: { value: 120, source: 'test', period: 'test', retrievedAt: '2026-01-01T00:00:00.000Z', unit: 'IDR' },
  dailyChange: 1, averageTradedValue: 10_000_000_000, priceHistory: [100, 105, 110, 120],
  technical: { oneWeek: 2, oneMonth: 4, threeMonth: 10, ma20: 110, ma50: 105 },
  fundamentals: { roe: 15, revenueGrowth: 10, debtToEquity: 0.4, pe: 12 },
}

const validSnapshot = { ticker: 'BBCA', source: 'reviewed test capture', retrievedAt: '2026-09-18T02:46:57.000Z', bars: [{ date: '2026-09-17', open: 8000, high: 8100, low: 7950, close: 8050, volume: 1_000_000 }, { date: '2026-09-18', open: 8050, high: 8150, low: 8000, close: 8100, volume: 1_200_000 }] }

const riskStock = (priceHistory: number[], threeMonth: number, ma20: number, ma50: number, volatility20: number | null = null): Stock => ({
  ...baseStock,
  price: { ...baseStock.price, value: priceHistory.at(-1) ?? null },
  priceHistory,
  technical: { oneWeek: threeMonth / 12, oneMonth: threeMonth / 3, threeMonth, ma20, ma50 },
  technicalReference: volatility20 === null ? undefined : { ma200: { ...baseStock.price, value: ma50 }, relativeVolume: { ...baseStock.price, value: 1 }, atr14: { ...baseStock.price, value: 1 }, volatility20: { ...baseStock.price, value: volatility20, unit: '%' }, recentHigh: { ...baseStock.price, value: Math.max(...priceHistory) }, recentLow: { ...baseStock.price, value: Math.min(...priceHistory) } },
})

describe('indicators', () => {
  it('calculates an average only with enough observations', () => { expect(movingAverage([1, 2, 3], 2)).toBe(2.5); expect(movingAverage([1, 2], 3)).toBeNull() })
  it('does not turn missing or invalid inputs into zero', () => { expect(percentageChange(null, 1)).toBeNull(); expect(relativeVolume(20, 0)).toBeNull() })
  it('calculates peak-to-trough drawdown', () => { expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(-25) })
})

describe('scoring integrity', () => {
  it('reports complete evidence and high confidence', () => { const result = scoreStock(baseStock); expect(result.score.coverage).toBe(100); expect(result.score.confidence).toBe('HIGH') })
  it('keeps a normalized score but reduces coverage when fundamental and valuation are missing', () => { const result = scoreStock({ ...baseStock, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.total).not.toBeNull(); expect(result.score.coverage).toBe(70); expect(result.score.confidence).toBe('MEDIUM'); expect(result.score.missingFactors).toEqual(['fundamental', 'valuation']) })
  it('uses banking net-profit growth as valid fundamental evidence without requiring industrial metrics', () => { const result = scoreStock({ ...baseStock, fundamentals: { roe: null, netProfitGrowth: 1.8, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.fundamental).not.toBeNull(); expect(result.score.missingFactors).toEqual(['valuation']) })
  it('selects applicable banking evidence through the profile rather than a ticker', () => { expect(businessProfiles.BANKING.fundamentalEvidence).toEqual(['netProfitGrowth', 'roe']); expect(availableFundamentalEvidence('BANKING', { roe: 20, netProfitGrowth: 2, revenueGrowth: null, debtToEquity: null, pe: null })).toEqual([2, 20]) })
  it('gates a high score with sparse data as insufficient evidence', () => { const result = scoreStock({ ...baseStock, averageTradedValue: null, priceHistory: [100], technical: { oneWeek: null, oneMonth: null, threeMonth: 20, ma20: null, ma50: null }, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }); expect(result.score.coverage).toBe(25); expect(result.score.total).toBeGreaterThan(75); expect(result.status).toBe('Insufficient Evidence') })
  it('classifies threshold boundaries transparently', () => { expect(confidenceForCoverage(85)).toBe('HIGH'); expect(confidenceForCoverage(84.99)).toBe('MEDIUM'); expect(confidenceForCoverage(65)).toBe('MEDIUM'); expect(confidenceForCoverage(64.99)).toBe('LIMITED'); expect(confidenceForCoverage(45)).toBe('LIMITED'); expect(confidenceForCoverage(44.99)).toBe('INSUFFICIENT') })
  it('keeps candidate status separate from risk level', () => { expect(statusFor(90, 'MEDIUM')).toBe('Candidate'); expect(riskLevelFor(0)).toBe('Low'); expect(riskLevelFor(34)).toBe('Moderate'); expect(riskLevelFor(67)).toBe('High') })
})

describe('risk calibration', () => {
  it('classifies healthy, mixed, weak, and severe setups predictably', () => {
    expect(scoreStock(riskStock([100, 105, 110, 120], 10, 110, 105)).score.riskLevel).toBe('Low')
    expect(scoreStock(riskStock([100, 120, 90], -6, 100, 105)).score.riskLevel).toBe('Moderate')
    expect(scoreStock(riskStock([100, 120, 72], -15, 85, 95)).score.riskLevel).toBe('High')
    expect(scoreStock(riskStock([100, 120, 48], -40, 70, 90, 5)).score.riskScore).toBe(100)
  })
  it('is monotonic for worsening drawdown, momentum, and volatility', () => {
    const mild = scoreStock(riskStock([100, 120, 100], -3, 105, 108, 2)).score.riskScore ?? 0
    expect(scoreStock(riskStock([100, 120, 80], -3, 90, 100, 2)).score.riskScore).toBeGreaterThanOrEqual(mild)
    expect(scoreStock(riskStock([100, 120, 100], -20, 105, 108, 2)).score.riskScore).toBeGreaterThanOrEqual(mild)
    expect(scoreStock(riskStock([100, 120, 100], -3, 105, 108, 5)).score.riskScore).toBeGreaterThanOrEqual(mild)
  })
  it('aggregates contributions without treating missing evidence as risk', () => {
    const stock = riskStock([100, 120, 72], -15, 85, 95, 3)
    const assessment = calculateRiskAssessment(stock, 0)
    expect(assessment.score).toBeCloseTo(assessment.components.reduce((total, component) => total + (component.contribution ?? 0), 0))
    expect(scoreStock({ ...stock, fundamentals: { roe: null, revenueGrowth: null, debtToEquity: null, pe: null } }).score.riskScore).toBe(scoreStock(stock).score.riskScore)
    expect(statusFor(48, 'HIGH')).toBe('Watch')
  })
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
    expect(scoreStock(bbcaReference).score.riskLevel).toBe('High')
    expect(scoreStock(bbcaReference).status).toBe('Watch')
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
