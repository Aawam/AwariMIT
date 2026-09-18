import { confidenceThresholds, screeningWeights } from '../config/screening'
import type { Confidence, ScoreBreakdown, ScoreFactor, ScreeningResult, Stock } from '../domain/types'

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const factorLabels: Record<ScoreFactor, string> = { momentum: 'momentum', technical: 'technical trend', fundamental: 'fundamental quality', liquidity: 'liquidity', valuation: 'valuation', risk: 'risk history' }

export function confidenceForCoverage(coverage: number): Confidence {
  if (coverage >= confidenceThresholds.high) return 'HIGH'
  if (coverage >= confidenceThresholds.medium) return 'MEDIUM'
  if (coverage >= confidenceThresholds.limited) return 'LIMITED'
  return 'INSUFFICIENT'
}

export function statusFor(total: number | null, confidence: Confidence, risk: number | null): string {
  if (total === null || confidence === 'INSUFFICIENT') return 'Insufficient Evidence'
  if (risk !== null && risk < 35) return 'High Risk'
  if (total >= 75 && confidence === 'HIGH') return 'Strong Candidate'
  if (total >= 60) return 'Candidate'
  if (total >= 45) return 'Watch'
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
  const factors: Record<ScoreFactor, number | null> = { momentum, technical: trend, fundamental, liquidity, valuation, risk }
  const totalConfiguredWeight = Object.values(screeningWeights).reduce((sum, weight) => sum + weight, 0)
  const availableWeight = (Object.entries(screeningWeights) as [ScoreFactor, number][]).reduce((sum, [key, weight]) => factors[key] === null ? sum : sum + weight, 0)
  const total = availableWeight === 0 ? null : (Object.entries(screeningWeights) as [ScoreFactor, number][]).reduce((sum, [key, weight]) => sum + ((factors[key] ?? 0) * weight), 0) / availableWeight
  const coverage = (availableWeight / totalConfiguredWeight) * 100
  const confidence = confidenceForCoverage(coverage)
  const missingFactors = (Object.keys(factors) as ScoreFactor[]).filter(key => factors[key] === null)
  const score: ScoreBreakdown = { ...factors, total, availableWeight, coverage, confidence, missingFactors }
  const reasons = [technical.threeMonth !== null && technical.threeMonth > 0 ? `3-month return is ${technical.threeMonth.toFixed(1)}%.` : null, trend !== null && trend >= 50 ? 'Price structure is above or near key moving averages.' : null, liquidity !== null ? 'Liquidity threshold is met by observed traded value.' : null, fundamental !== null ? 'Fundamental quality is included from a dated snapshot.' : null].filter((item): item is string => item !== null)
  const risks = [technical.threeMonth !== null && technical.threeMonth < 0 ? 'Three-month momentum is negative.' : null, trend !== null && trend < 45 ? 'Price is below its short-term trend reference.' : null, missingFactors.length > 0 ? `Missing evidence: ${missingFactors.map(key => factorLabels[key]).join(', ')}.` : null, 'Past price behaviour does not predict future returns.'].filter((item): item is string => item !== null)
  return { ...stock, score, status: statusFor(total, confidence, risk), reasons, risks }
}

export function rankStocks(stocks: Stock[]): ScreeningResult[] {
  return stocks.map(scoreStock).sort((a, b) => (b.score.total ?? -1) - (a.score.total ?? -1))
}

export { factorLabels }
