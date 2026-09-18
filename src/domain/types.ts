export type DataPoint<T> = { value: T | null; source: string; period: string; retrievedAt: string; unit: string; method?: string }

export type PeriodType = 'Q1' | 'H1' | '9M' | 'FY'
export type BusinessProfile = 'BANKING'
export type SourceQuality = 'OFFICIAL_ISSUER' | 'PUBLIC_SECONDARY'
export type MetricStatus = 'REPORTED' | 'DERIVED'
export type FundamentalMetric = { name: string; value: number | null; unit: string; status: MetricStatus; method?: string }
export type FundamentalSnapshot = {
  ticker: string
  sectorProfile: BusinessProfile
  reportingPeriod: string
  periodType: PeriodType
  publicationDate: string
  retrievedAt: string
  source: string
  sourceUrl: string
  sourceQuality: SourceQuality
  consolidation: 'Consolidated' | 'Parent-only'
  metrics: FundamentalMetric[]
}

export type NewsCategory = 'Earnings' | 'Corporate Action' | 'Contract' | 'Dividend' | 'Regulatory' | 'Commodity' | 'Management' | 'Macro' | 'Other'
export type NewsSentiment = 'Positive' | 'Neutral' | 'Negative' | 'Unclear'
export type NewsItem = { title: string; publisher: string; publishedAt: string; url: string; ticker: string; category: NewsCategory; relevance: 'High' | 'Medium' | 'Low'; sentiment: NewsSentiment; sourceType: 'Bundled sample' | 'Live provider' | 'Official filing' }

export type FundamentalMetrics = {
  revenueGrowth: number | null
  netProfitGrowth?: number | null
  roe: number | null
  debtToEquity: number | null
  pe: number | null
  source?: string
  period?: string
  retrievedAt?: string
}

export type TechnicalReference = {
  ma200: DataPoint<number>
  relativeVolume: DataPoint<number>
  atr14: DataPoint<number>
  volatility20: DataPoint<number>
  recentHigh: DataPoint<number>
  recentLow: DataPoint<number>
}

export type Stock = {
  ticker: string
  name: string
  sector: string
  profile: BusinessProfile
  description: string
  price: DataPoint<number>
  dailyChange: number | null
  averageTradedValue: number | null
  priceHistory: number[]
  technical: { oneWeek: number | null; oneMonth: number | null; threeMonth: number | null; ma20: number | null; ma50: number | null }
  fundamentals: FundamentalMetrics
  fundamentalSnapshots?: FundamentalSnapshot[]
  technicalReference?: TechnicalReference
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LIMITED' | 'INSUFFICIENT'
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Unavailable'
export type RiskComponent = { key: 'drawdown' | 'priceWeakness' | 'volatility'; label: string; rawValue: number | null; normalizedRisk: number | null; weight: number; contribution: number | null }
export type RiskAssessment = { score: number | null; level: RiskLevel; quality: number | null; components: RiskComponent[]; drivers: string[] }
export type ScoreFactor = 'momentum' | 'technical' | 'fundamental' | 'liquidity' | 'valuation' | 'risk'
export type ScoreBreakdown = Record<ScoreFactor, number | null> & { total: number | null; availableWeight: number; coverage: number; confidence: Confidence; missingFactors: ScoreFactor[]; riskAssessment: RiskAssessment; riskScore: number | null; riskLevel: RiskLevel; riskDrivers: string[] }
export type ScreeningResult = Stock & { score: ScoreBreakdown; status: string; reasons: string[]; risks: string[] }
