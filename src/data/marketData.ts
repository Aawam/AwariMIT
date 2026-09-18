import { bbcaPriceBars } from './bbcaPriceBars'
import type { Stock } from '../domain/types'

const retrievedAt = '2026-09-18T02:46:57.000Z'
const marketSource = 'Yahoo Finance chart API for BBCA.JK (unofficial market-data convenience source)'
const annualReportUrl = 'https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf'
const annualReportSource = 'PT Bank Central Asia Tbk Annual Report 2025, Financial Highlights, pp. 14–15'
const closes = bbcaPriceBars.map(bar => bar.close)
const volumes = bbcaPriceBars.map(bar => bar.volume)
const average = (values: readonly number[]) => values.reduce((total, value) => total + value, 0) / values.length
const change = (period: number) => (closes.at(-1)! / closes.at(-1 - period)! - 1) * 100
const trueRanges = bbcaPriceBars.slice(1).map((bar, index) => Math.max(bar.high - bar.low, Math.abs(bar.high - bbcaPriceBars[index].close), Math.abs(bar.low - bbcaPriceBars[index].close)))
const point = (value: number, period: string, unit: string, source = marketSource, method?: string) => ({ value, source, period, retrievedAt, unit, method })
const annual = (value: number, unit: string, method?: string) => point(value, 'FY2025, year ended 31 December 2025', unit, annualReportSource, method)

export const bbcaReference: Stock = {
  ticker: 'BBCA',
  name: 'PT Bank Central Asia Tbk',
  sector: 'Financials',
  description: 'Indonesian commercial bank. V0.2 reference stock with a bundled one-year price/volume capture and issuer-published FY2025 fundamentals.',
  price: point(closes.at(-1)!, 'Daily close, 18 September 2026', 'IDR'),
  dailyChange: (closes.at(-1)! / closes.at(-2)! - 1) * 100,
  averageTradedValue: average(volumes.slice(-20)) * average(closes.slice(-20)),
  priceHistory: [...closes],
  technical: {
    oneWeek: change(5), oneMonth: change(21), threeMonth: change(63),
    ma20: average(closes.slice(-20)), ma50: average(closes.slice(-50)),
  },
  fundamentals: {
    revenueGrowth: null,
    roe: annual(23.3, '%').value,
    debtToEquity: null,
    pe: annual(17.3, 'x').value,
    source: `${annualReportSource}; ${annualReportUrl}`,
    period: 'FY2025, year ended 31 December 2025',
    retrievedAt,
  },
}

export const bbcaTechnicalReference = {
  ma200: point(average(closes.slice(-200)), '200 trading-day moving average ending 18 September 2026', 'IDR', marketSource, 'Simple moving average of bundled daily closes'),
  relativeVolume: point(volumes.at(-1)! / average(volumes.slice(-20)), '18 September 2026 versus trailing 20 trading sessions', 'x', marketSource, 'Last-session volume / mean trailing 20-session volume'),
  atr14: point(average(trueRanges.slice(-14)), '14 trading sessions ending 18 September 2026', 'IDR', marketSource, 'Simple average true range'),
  volatility20: point(Math.sqrt(average(closes.slice(-20).slice(1).map((price, index) => ((price / closes.slice(-20)[index]) - 1) ** 2))) * 100, '20 trading sessions ending 18 September 2026', '%', marketSource, 'Root mean square daily return; not annualized'),
  recentHigh: point(Math.max(...closes.slice(-20)), 'Trailing 20 trading sessions', 'IDR', marketSource),
  recentLow: point(Math.min(...closes.slice(-20)), 'Trailing 20 trading sessions', 'IDR', marketSource),
}

export const bbcaFundamentalReference = {
  totalAssets: annual(1_586_829, 'IDR billion'), totalEquity: annual(281_688, 'IDR billion'), operatingIncome: annual(112_006, 'IDR billion'), netIncome: annual(57_563, 'IDR billion'), netIncomeGrowth: annual(4.9, '%', 'Issuer-reported year-on-year growth'), eps: annual(467, 'IDR per share'), roa: annual(3.9, '%'), roe: annual(23.3, '%'), pe: annual(17.3, 'x'), pbv: annual(3.8, 'x'), marketCapAtYearEnd: annual(995, 'IDR trillion'), sourceUrl: annualReportUrl,
}

export const stocks: Stock[] = [bbcaReference]
export const market = { name: 'IHSG', price: 6436.85, oneWeek: -3.61, oneMonth: 0.55, ma20: 6547.1, ma50: 6342.18, updatedAt: '2026-09-16T02:00:00.000Z', source: 'Yahoo Finance chart API (unofficial; captured prior to V0.2)' }
export const dataNotice = 'BBCA is the V0.2 reference stock. Daily price and volume are a bundled 18 Sep 2026 Yahoo Finance capture; this convenience source is unofficial and may be delayed. FY2025 fundamentals are from BCA’s issuer-published Annual Report 2025. Freshness is displayed with every source; do not treat bundled data as live.'
