import type { FundamentalSnapshot } from '../domain/types'

const retrievedAt = '2026-09-18T02:46:57.000Z'
const annualReportUrl = 'https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf'
const h1ReportUrl = 'https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Triwulan/2026/20260728-financial-report-june-2026.pdf'

export const bbcaAnnualReference: FundamentalSnapshot = {
  ticker: 'BBCA',
  sectorProfile: 'BANKING',
  reportingPeriod: 'FY2025, year ended 31 December 2025',
  periodType: 'FY',
  publicationDate: '2026-02-12',
  retrievedAt,
  source: 'PT Bank Central Asia Tbk Annual Report 2025, Financial Highlights, pp. 14–15',
  sourceUrl: annualReportUrl,
  sourceQuality: 'OFFICIAL_ISSUER',
  consolidation: 'Consolidated',
  metrics: [
    { name: 'Total assets', value: 1_586_829, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Total equity', value: 281_688, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Operating income', value: 112_006, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Net profit', value: 57_563, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Net profit growth', value: 4.9, unit: '% YoY', status: 'REPORTED' },
    { name: 'EPS', value: 467, unit: 'IDR per share', status: 'REPORTED' },
    { name: 'ROA', value: 3.9, unit: '%', status: 'REPORTED' },
    { name: 'ROE', value: 23.3, unit: '%', status: 'REPORTED' },
    { name: 'P/E', value: 17.3, unit: 'x', status: 'REPORTED' },
    { name: 'P/BV', value: 3.8, unit: 'x', status: 'REPORTED' },
  ],
}

export const bbcaH12026Snapshot: FundamentalSnapshot = {
  ticker: 'BBCA',
  sectorProfile: 'BANKING',
  reportingPeriod: 'H1 2026, six months ended 30 June 2026',
  periodType: 'H1',
  publicationDate: '2026-07-28',
  retrievedAt,
  source: 'PT Bank Central Asia Tbk Financial Report June 2026, consolidated statements, pp. 1–3',
  sourceUrl: h1ReportUrl,
  sourceQuality: 'OFFICIAL_ISSUER',
  consolidation: 'Consolidated',
  metrics: [
    { name: 'Total assets', value: 1_660_579.336, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Total equity', value: 270_437.543, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Net interest income', value: 42_604.563, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Operating profit', value: 36_611.227, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Net profit', value: 29_545.621, unit: 'IDR billion', status: 'REPORTED' },
    { name: 'Net profit growth', value: 1.8, unit: '% YoY', status: 'DERIVED', method: '(H1 2026 Rp29,545.621B / H1 2025 Rp29,022.969B - 1) × 100; both consolidated values reported in the same filing.' },
  ],
}

export const bbcaFundamentalSnapshots = [bbcaAnnualReference, bbcaH12026Snapshot] as const

export function metricValue(snapshot: FundamentalSnapshot, name: string): number | null {
  return snapshot.metrics.find(metric => metric.name === name)?.value ?? null
}
