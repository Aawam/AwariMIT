export type DataPoint<T> = { value: T | null; source: string; period: string; retrievedAt: string; unit: string; method?: string }

export type NewsCategory = 'Earnings' | 'Corporate Action' | 'Contract' | 'Dividend' | 'Regulatory' | 'Commodity' | 'Management' | 'Macro' | 'Other'
export type NewsSentiment = 'Positive' | 'Neutral' | 'Negative' | 'Unclear'
export type NewsItem = { title: string; publisher: string; publishedAt: string; url: string; ticker: string; category: NewsCategory; relevance: 'High' | 'Medium' | 'Low'; sentiment: NewsSentiment; sourceType: 'Bundled sample' | 'Live provider' | 'Official filing' }

export type FundamentalMetrics = {
  revenueGrowth: number | null
  roe: number | null
  debtToEquity: number | null
  pe: number | null
  source?: string
  period?: string
  retrievedAt?: string
}

export type Stock = {
  ticker: string
  name: string
  sector: string
  description: string
  price: DataPoint<number>
  dailyChange: number | null
  averageTradedValue: number | null
  priceHistory: number[]
  technical: { oneWeek: number | null; oneMonth: number | null; threeMonth: number | null; ma20: number | null; ma50: number | null }
  fundamentals: FundamentalMetrics
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LIMITED' | 'INSUFFICIENT'
export type ScoreFactor = 'momentum' | 'technical' | 'fundamental' | 'liquidity' | 'valuation' | 'risk'
export type ScoreBreakdown = Record<ScoreFactor, number | null> & { total: number | null; availableWeight: number; coverage: number; confidence: Confidence; missingFactors: ScoreFactor[] }
export type ScreeningResult = Stock & { score: ScoreBreakdown; status: string; reasons: string[]; risks: string[] }
