import { confidenceThresholds, riskCalibration, riskLevelThresholds, screeningWeights } from '../config/screening'
import { availableFundamentalEvidence } from '../config/businessProfiles'
import type { Confidence, RiskAssessment, RiskComponent, RiskLevel, ScoreBreakdown, ScoreFactor, ScreeningResult, Stock } from '../domain/types'

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const factorLabels: Record<ScoreFactor, string> = { momentum: 'momentum', technical: 'technical trend', fundamental: 'fundamental quality', liquidity: 'liquidity', valuation: 'valuation', risk: 'risk quality' }

export function confidenceForCoverage(coverage: number): Confidence {
  if (coverage >= confidenceThresholds.high) return 'HIGH'
  if (coverage >= confidenceThresholds.medium) return 'MEDIUM'
  if (coverage >= confidenceThresholds.limited) return 'LIMITED'
  return 'INSUFFICIENT'
}

export function statusFor(total: number | null, confidence: Confidence): string {
  if (total === null || confidence === 'INSUFFICIENT') return 'Insufficient Evidence'
  if (total >= 75 && confidence === 'HIGH') return 'Strong Candidate'
  if (total >= 60) return 'Candidate'
  if (total >= 45) return 'Watch'
  return 'Weak Setup'
}

export function riskLevelFor(riskScore: number | null): RiskLevel {
  if (riskScore === null) return 'Unavailable'
  if (riskScore <= riskLevelThresholds.lowMax) return 'Low'
  if (riskScore <= riskLevelThresholds.moderateMax) return 'Moderate'
  return 'High'
}

export function calculateRiskAssessment(stock: Stock, trend: number | null): RiskAssessment {
  const drawdownRatio = stock.priceHistory.length > 1 ? Math.min(...stock.priceHistory.map((price, index) => price / Math.max(...stock.priceHistory.slice(0, index + 1)))) : null
  const drawdownPercent = drawdownRatio === null ? null : (1 - drawdownRatio) * 100
  const drawdownNormalized = drawdownPercent === null ? null : clamp(drawdownPercent / riskCalibration.drawdown.maxDrawdownPercent * 100)
  const drawdownContribution = drawdownNormalized === null ? null : drawdownNormalized * riskCalibration.drawdown.maxContribution / 100

  const momentumNormalized = stock.technical.threeMonth === null ? null : clamp(Math.max(0, -stock.technical.threeMonth) / riskCalibration.priceWeakness.maxNegativeThreeMonthReturn * 100)
  const trendNormalized = trend === null ? null : clamp((50 - trend) / 50 * 100)
  const priceWeaknessNormalized = [momentumNormalized, trendNormalized].filter((value): value is number => value !== null).reduce<number | null>((highest, value) => highest === null ? value : Math.max(highest, value), null)
  const priceWeaknessContribution = priceWeaknessNormalized === null ? null : priceWeaknessNormalized * riskCalibration.priceWeakness.maxContribution / 100

  const volatilityPercent = stock.technicalReference?.volatility20.value ?? null
  const volatilityNormalized = volatilityPercent === null ? null : clamp((volatilityPercent - riskCalibration.volatility.baselinePercent) / (riskCalibration.volatility.fullRiskPercent - riskCalibration.volatility.baselinePercent) * 100)
  const volatilityContribution = volatilityNormalized === null ? null : volatilityNormalized * riskCalibration.volatility.maxContribution / 100

  const components: RiskComponent[] = [
    { key: 'drawdown', label: 'Captured-period drawdown', rawValue: drawdownPercent, normalizedRisk: drawdownNormalized, weight: riskCalibration.drawdown.maxContribution, contribution: drawdownContribution },
    { key: 'priceWeakness', label: 'Momentum / trend weakness (maximum)', rawValue: priceWeaknessNormalized, normalizedRisk: priceWeaknessNormalized, weight: riskCalibration.priceWeakness.maxContribution, contribution: priceWeaknessContribution },
    { key: 'volatility', label: '20-day volatility', rawValue: volatilityPercent, normalizedRisk: volatilityNormalized, weight: riskCalibration.volatility.maxContribution, contribution: volatilityContribution },
  ]
  const score = drawdownContribution === null ? null : clamp(components.reduce((total, component) => total + (component.contribution ?? 0), 0))
  const drivers = [
    drawdownPercent !== null && drawdownPercent > 10 ? `Price is ${drawdownPercent.toFixed(1)}% below its captured-period peak.` : null,
    momentumNormalized !== null && momentumNormalized > 0 ? 'Three-month momentum is negative.' : null,
    trendNormalized !== null && trendNormalized > 0 ? 'Price is below its short-term trend reference.' : null,
    volatilityNormalized !== null && volatilityNormalized >= 50 ? 'Observed 20-day volatility is elevated.' : null,
  ].filter((item): item is string => item !== null)
  return { score, level: riskLevelFor(score), quality: score === null ? null : 100 - score, components, drivers }
}

export function scoreStock(stock: Stock): ScreeningResult {
  const { technical, fundamentals } = stock
  const momentum = technical.threeMonth === null ? null : clamp(50 + technical.threeMonth * 5 + (technical.oneMonth ?? 0) * 2)
  const trend = stock.price.value === null || technical.ma20 === null || technical.ma50 === null ? null : clamp(50 + (stock.price.value / technical.ma20 - 1) * 500 + (technical.ma20 / technical.ma50 - 1) * 300)
  const growth = fundamentals.netProfitGrowth ?? fundamentals.revenueGrowth
  const profileEvidence = availableFundamentalEvidence(stock.profile, fundamentals)
  const fundamental = profileEvidence.length === 0 ? null : clamp(45 + (fundamentals.roe ?? 0) * 1.5 + (growth ?? 0) * 1.2 - Math.max(0, (fundamentals.debtToEquity ?? 0) - 1) * 10)
  const liquidity = stock.averageTradedValue === null ? null : clamp(35 + Math.log10(Math.max(stock.averageTradedValue, 1)) * 5)
  const valuation = fundamentals.pe === null ? null : clamp(75 - Math.max(0, fundamentals.pe - 10) * 2)
  const riskAssessment = calculateRiskAssessment(stock, trend)
  const factors: Record<ScoreFactor, number | null> = { momentum, technical: trend, fundamental, liquidity, valuation, risk: riskAssessment.quality }
  const totalConfiguredWeight = Object.values(screeningWeights).reduce((sum, weight) => sum + weight, 0)
  const availableWeight = (Object.entries(screeningWeights) as [ScoreFactor, number][]).reduce((sum, [key, weight]) => factors[key] === null ? sum : sum + weight, 0)
  const total = availableWeight === 0 ? null : (Object.entries(screeningWeights) as [ScoreFactor, number][]).reduce((sum, [key, weight]) => sum + ((factors[key] ?? 0) * weight), 0) / availableWeight
  const coverage = (availableWeight / totalConfiguredWeight) * 100
  const confidence = confidenceForCoverage(coverage)
  const missingFactors = (Object.keys(factors) as ScoreFactor[]).filter(key => factors[key] === null)
  const score: ScoreBreakdown = { ...factors, total, availableWeight, coverage, confidence, missingFactors, riskAssessment, riskScore: riskAssessment.score, riskLevel: riskAssessment.level, riskDrivers: riskAssessment.drivers }
  const reasons = [technical.threeMonth !== null && technical.threeMonth > 0 ? `3-month return is ${technical.threeMonth.toFixed(1)}%.` : null, trend !== null && trend >= 50 ? 'Price structure is above or near key moving averages.' : null, liquidity !== null ? 'Liquidity threshold is met by observed traded value.' : null, fundamental !== null ? 'Fundamental quality is included from a dated snapshot.' : null].filter((item): item is string => item !== null)
  const risks = [...riskAssessment.drivers, missingFactors.length > 0 ? `Missing evidence: ${missingFactors.map(key => factorLabels[key]).join(', ')}.` : null, 'Past price behaviour does not predict future returns.'].filter((item): item is string => item !== null)
  return { ...stock, score, status: statusFor(total, confidence), reasons, risks }
}

export function rankStocks(stocks: Stock[]): ScreeningResult[] {
  return stocks.map(scoreStock).sort((a, b) => (b.score.total ?? -1) - (a.score.total ?? -1))
}

export { factorLabels }
