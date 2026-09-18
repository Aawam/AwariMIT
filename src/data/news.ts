import type { NewsItem } from '../domain/types'

export interface NewsProvider { getByTicker(ticker: string): NewsItem[] }

const bcaAnnualReport2025 = 'https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf'
const officialFilings: NewsItem[] = [
  { ticker: 'BBCA', title: 'BCA Annual Report 2025: net income Rp57.6 trillion, up 4.9% year-on-year.', publisher: 'PT Bank Central Asia Tbk', publishedAt: '2026-02-12T00:00:00.000Z', url: bcaAnnualReport2025, category: 'Earnings', relevance: 'High', sentiment: 'Neutral', sourceType: 'Official filing' },
  { ticker: 'BBCA', title: 'BCA Annual Report 2025 records two share-buyback programmes totalling Rp3.3 trillion / 399 million shares acquired.', publisher: 'PT Bank Central Asia Tbk', publishedAt: '2026-02-12T00:00:00.000Z', url: bcaAnnualReport2025, category: 'Corporate Action', relevance: 'Medium', sentiment: 'Neutral', sourceType: 'Official filing' },
]

export const officialFilingNewsProvider: NewsProvider = { getByTicker: ticker => officialFilings.filter(item => item.ticker === ticker) }
export const bundledNewsProvider = officialFilingNewsProvider
export const newsNotice = 'This section contains issuer-published filing facts, not a real-time news feed. Titles summarize reported facts from the linked Annual Report; the app does not infer a market outcome or trade signal.'
