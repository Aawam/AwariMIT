import { bbcaPriceBars } from './bbcaPriceBars'
import { bbcaAnnualReference, bbcaFundamentalSnapshots, bbcaH12026Snapshot, metricValue } from './fundamentals'
import type { Stock } from '../domain/types'

const marketRetrievedAt = '2026-09-18T02:46:57.000Z'
const marketSource = 'Yahoo Finance chart API for BBCA.JK (PUBLIC_SECONDARY prototype convenience capture)'
const closes = bbcaPriceBars.map(bar => bar.close)
const volumes = bbcaPriceBars.map(bar => bar.volume)
const average = (values: readonly number[]) => values.reduce((total, value) => total + value, 0) / values.length
const change = (period: number) => (closes.at(-1)! / closes.at(-1 - period)! - 1) * 100
const trueRanges = bbcaPriceBars.slice(1).map((bar, index) => Math.max(bar.high - bar.low, Math.abs(bar.high - bbcaPriceBars[index].close), Math.abs(bar.low - bbcaPriceBars[index].close)))
const point = (value: number, period: string, unit: string, source = marketSource, method?: string) => ({ value, source, period, retrievedAt: marketRetrievedAt, unit, method })

export const bbcaTechnicalReference = {
  ma200: point(average(closes.slice(-200)), '200 trading-day moving average ending 18 September 2026', 'IDR', marketSource, 'Simple moving average of bundled daily closes'),
  relativeVolume: point(volumes.at(-1)! / average(volumes.slice(-20)), '18 September 2026 versus trailing 20 trading sessions', 'x', marketSource, 'Last-session volume / mean trailing 20-session volume'),
  atr14: point(average(trueRanges.slice(-14)), '14 trading sessions ending 18 September 2026', 'IDR', marketSource, 'Simple average true range'),
  volatility20: point(Math.sqrt(average(closes.slice(-20).slice(1).map((price, index) => ((price / closes.slice(-20)[index]) - 1) ** 2))) * 100, '20 trading sessions ending 18 September 2026', '%', marketSource, 'Root mean square daily return; not annualized'),
  recentHigh: point(Math.max(...closes.slice(-20)), 'Trailing 20 trading sessions', 'IDR', marketSource),
  recentLow: point(Math.min(...closes.slice(-20)), 'Trailing 20 trading sessions', 'IDR', marketSource),
}

export const bbcaReference: Stock = {
  ticker: 'BBCA',
  name: 'PT Bank Central Asia Tbk',
  sector: 'Financials · Banking',
  profile: 'BANKING',
  description: 'Indonesian commercial bank. Reference stock with a bundled one-year price/volume capture and period-aware issuer fundamentals.',
  price: point(closes.at(-1)!, 'Daily close, 18 September 2026', 'IDR'),
  dailyChange: (closes.at(-1)! / closes.at(-2)! - 1) * 100,
  averageTradedValue: average(volumes.slice(-20)) * average(closes.slice(-20)),
  priceHistory: [...closes],
  technical: { oneWeek: change(5), oneMonth: change(21), threeMonth: change(63), ma20: average(closes.slice(-20)), ma50: average(closes.slice(-50)) },
  fundamentals: {
    revenueGrowth: null,
    netProfitGrowth: metricValue(bbcaH12026Snapshot, 'Net profit growth'),
    roe: null,
    debtToEquity: null,
    pe: null,
    source: `${bbcaH12026Snapshot.source}; ${bbcaH12026Snapshot.sourceUrl}`,
    period: bbcaH12026Snapshot.reportingPeriod,
    retrievedAt: bbcaH12026Snapshot.retrievedAt,
  },
  fundamentalSnapshots: [...bbcaFundamentalSnapshots],
  technicalReference: bbcaTechnicalReference,
}

export const bbcaFundamentalReference = bbcaAnnualReference
export { bbcaAnnualReference, bbcaFundamentalSnapshots, bbcaH12026Snapshot }
export const stocks: Stock[] = [bbcaReference]
export const market = { name: 'IHSG', price: 6436.85, oneWeek: -3.61, oneMonth: 0.55, ma20: 6547.1, ma50: 6342.18, updatedAt: '2026-09-16T02:00:00.000Z', source: 'Yahoo Finance chart API (PUBLIC_SECONDARY; captured prior to V0.2)' }
export const dataNotice = 'BBCA market history is a static PUBLIC_SECONDARY capture, not live market data. Latest issuer fundamentals are from BCA’s H1 2026 report; FY2025 remains a separate annual reference. Review reporting period, publication date and source before use.'
