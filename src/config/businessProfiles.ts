import type { BusinessProfile, FundamentalMetrics } from '../domain/types'

type FundamentalEvidenceKey = 'netProfitGrowth' | 'roe'
type BusinessProfileDefinition = {
  label: string
  fundamentalEvidence: readonly FundamentalEvidenceKey[]
  interimMetrics: readonly string[]
  annualMetrics: readonly string[]
  unavailableMetricNotice: string
}

export const businessProfiles: Record<BusinessProfile, BusinessProfileDefinition> = {
  BANKING: {
    label: 'Banking',
    fundamentalEvidence: ['netProfitGrowth', 'roe'],
    interimMetrics: ['Net profit', 'Net profit growth', 'Net interest income', 'Operating profit', 'Total assets', 'Total equity'],
    annualMetrics: ['Net profit', 'ROA', 'ROE', 'EPS', 'P/E', 'P/BV'],
    unavailableMetricNotice: 'Banking evidence does not require industrial metrics such as inventory turnover, gross margin, or EV/EBITDA.',
  },
}

export function availableFundamentalEvidence(profile: BusinessProfile, fundamentals: FundamentalMetrics): number[] {
  return businessProfiles[profile].fundamentalEvidence.map(key => fundamentals[key]).filter((value): value is number => value !== null && value !== undefined)
}
