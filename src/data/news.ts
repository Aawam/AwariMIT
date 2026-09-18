import type { NewsItem } from '../domain/types'

export interface NewsProvider { getByTicker(ticker: string): NewsItem[] }

const fixtureNews: NewsItem[] = [
  { ticker: 'BBCA', title: 'Bundled sample: use a verified issuer disclosure or licensed provider before acting on an event.', publisher: 'AwariMIT fixture', publishedAt: '2026-09-16T02:00:00.000Z', url: 'https://www.idx.co.id', category: 'Other', relevance: 'Low', sentiment: 'Unclear', sourceType: 'Bundled sample' },
]

export const bundledNewsProvider: NewsProvider = { getByTicker: ticker => fixtureNews.filter(item => item.ticker === ticker) }
export const newsNotice = 'News is a bundled sample fixture, not a live feed. It demonstrates the traceable news contract only; verify issuer disclosures and original publishers before acting.'
