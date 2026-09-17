import { screeningWeights } from '../config/screening'
import type { ScoreBreakdown, ScreeningResult, Stock } from '../domain/types'

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const weighted = (value: number | null, weight: number) => value === null ? null : clamp(value) * weight

function statusFor(total: number | null): string {
  if (total === null) return 'Insufficient Data'
  if (total >= 75) return 'Strong Candidate'
  if (total >= 60) return 'Candidate'
  if (total >= 45) return 'Watch'
  if (total >= 30) return 'Neutral'
  return 'Weak Setup'
}

export function scoreStock(stock: Stock): ScreeningResult {
  const { technical, fundamentals } = stock
  const momentum = technical.threeMonth === null ? null : clamp(50 + technical.threeMonth * 5 + (technical.oneMonth ?? 0) * 2)
  const trend = stock.price.value === null || technical.ma20 === null || technical.ma50 === null ? null : clamp(50 + (stock.price.value / technical.ma20 - 1) * 500 + (technical.ma20 / technical.ma50 - 1) * 300)
  const fundamental = fundamentals.roe === null && fundamentals.revenueGrowth === null ? null : clamp(45 + (fundamentals.roe ?? 0) * 1.5 + (fundamentals.revenueGrowth ?? 0) * 1.2 - Math.max(0, (fundamentals.debtToEquity ?? 0) - 1) * 10)
  const liquidity = stock.averageTradedValue === null ? null : clamp(35 + Math.log10(Math.max(stock.averageTradedValue, 1)) * 5)
  const valuation = fundamentals.pe === null ? null : clamp(75 - Math.max(0, fundamentals.pe - 10) * 2)
  const drawdown = stock.priceHistory.length > 1 ? Math.min(...stock.priceHistory.map((price, index) => price / Math.max(...stock.priceHistory.slice(0, index + 1)))) : null
  const risk = drawdown === null ? null : clamp(100 - (1 - drawdown) * 250)
  const raw: Record<keyof typeof screeningWeights, number | null> = { momentum, technical: trend, fundamental, liquidity, valuation, risk }
  const availableWeight = Object.entries(screeningWeights).reduce((sum, [key, weight]) => raw[key as keyof typeof raw] === null ? sum : sum + weight, 0)
  const total = availableWeight === 0 ? null : Object.entries(screeningWeights).reduce((sum, [key, weight]) => sum + ((weighted(raw[key as keyof typeof raw], weight) ?? 0)), 0) / availableWeight
  const score: ScoreBreakdown = { ...raw, total, availableWeight }
  const reasons = [technical.threeMonth !== null && technical.threeMonth > 0 ? `3-month return is ${technical.threeMonth.toFixed(1)}%.` : null, trend !== null && trend >= 50 ? 'Price structure is above or near key moving averages.' : null, liquidity !== null ? 'Liquidity threshold is met by average traded value.' : null, fundamental === null ? 'Fundamental provider data is unavailable and excluded from the score.' : `Fundamental quality is included from the latest available snapshot.`].filter((item): item is string => item !== null)
  const risks = [technical.threeMonth !== null && technical.threeMonth < 0 ? 'Three-month momentum is negative.' : null, trend !== null && trend < 45 ? 'Price is below its short-term trend reference.' : null, fundamental === null ? 'Fundamental metrics are unavailable; do not infer company quality from this screen.' : null, 'Past price behaviour does not predict future returns.'].filter((item): item is string => item !== null)
  return { ...stock, score, status: statusFor(total), reasons, risks }
}

export function rankStocks(stocks: Stock[]): ScreeningResult[] {
  return stocks.map(scoreStock).sort((a, b) => (b.score.total ?? -1) - (a.score.total ?? -1))
}
