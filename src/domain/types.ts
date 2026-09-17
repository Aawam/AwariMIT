export type DataPoint<T> = { value: T | null; source: string; period: string; retrievedAt: string; unit: string; method?: string }

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
  fundamentals: { roe: number | null; revenueGrowth: number | null; debtToEquity: number | null; pe: number | null; source?: string; period?: string; retrievedAt?: string }
}

export type ScoreBreakdown = { momentum: number | null; technical: number | null; fundamental: number | null; liquidity: number | null; valuation: number | null; risk: number | null; total: number | null; availableWeight: number }
export type ScreeningResult = Stock & { score: ScoreBreakdown; status: string; reasons: string[]; risks: string[] }
