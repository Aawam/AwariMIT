import type { Stock } from '../domain/types'

const source = 'Yahoo Finance chart API (unofficial; verify before acting)'
const retrievedAt = '2026-09-16T02:00:00.000Z'
const point = (value: number) => ({ value, source, period: 'Daily close; 6-month window', retrievedAt, unit: 'IDR' })

const definitions = [
  ['BBCA', 'PT Bank Central Asia Tbk', 'Financials', 'Private commercial bank.', 6325, 72157400, -3.07, -0.39, 0.8, 6490, 6389.5, 10.13, 24.1, 0.42, 13.55, [6525,6500,6275,6275,6300,6225,6275,6450,6325,6300,6500,6450,6350,6375,6375,6300,6350,6375,6350,6300,6300,6400,6450,6400,6350,6400,6475,6475,6600,6675,6775,6700,6625,6675,6525,6425,6325,6500,6400,6325]],
  ['BMRI', 'PT Bank Mandiri (Persero) Tbk', 'Financials', 'State-owned commercial bank.', 4260, 140870900, -2.96, 2.65, -4.7, 4308, 4246.4, null, null, null, null, [4420,4380,4130,4160,4100,4090,4160,4190,4170,4260,4220,4200,4240,4180,4120,4130,4130,4170,4150,4140,4150,4220,4200,4200,4160,4210,4250,4230,4320,4360,4460,4420,4390,4430,4390,4370,4360,4440,4340,4260]],
  ['TLKM', 'PT Telkom Indonesia (Persero) Tbk', 'Telecommunication', 'Integrated telecommunications operator.', 2660, 72687900, 0, 2.31, -4.32, 2622.5, 2620.2, null, null, null, null, [2700,2650,2630,2590,2560,2560,2670,2630,2740,2790,2710,2650,2710,2620,2610,2590,2590,2620,2600,2600,2610,2610,2620,2620,2600,2610,2570,2600,2610,2590,2600,2610,2610,2650,2660,2630,2600,2690,2700,2660]],
  ['ASII', 'PT Astra International Tbk', 'Industrials', 'Diversified automotive and industrial group.', 4850, 35084600, 0, 1.25, 1.68, 4861, 4919.6, null, null, null, null, [5150,5000,4980,4910,4970,4960,4950,5100,5050,5125,5025,5100,5100,5000,4870,4860,4800,4780,4790,4730,4790,4780,4790,4790,4780,4790,4800,4800,4920,4840,5050,4900,4910,4930,4850,4870,4910,4980,4890,4850]],
  ['ANTM', 'PT Aneka Tambang Tbk', 'Basic Materials', 'Indonesian mining and metals company.', 3220, 142697700, 0.63, 3.87, 1.58, 3162.5, 3062, null, null, null, null, [3120,3080,2990,2970,2890,2840,2860,2880,2870,2890,3070,3080,3160,3140,3090,3090,3000,3070,3100,3030,3140,3170,3190,3190,3160,3180,3160,3100,3080,3030,3150,3120,3080,3080,3200,3270,3270,3190,3270,3220]],
] as const

export const stocks: Stock[] = definitions.map(([ticker, name, sector, description, price, volume, oneWeek, oneMonth, threeMonth, ma20, ma50, roe, revenueGrowth, debtToEquity, pe, priceHistory]) => ({
  ticker,
  name,
  sector,
  description,
  price: point(price),
  dailyChange: ((price / priceHistory.at(-2)! - 1) * 100),
  averageTradedValue: price * volume,
  priceHistory: [...priceHistory],
  technical: { oneWeek, oneMonth, threeMonth, ma20, ma50 },
  fundamentals: { roe, revenueGrowth, debtToEquity, pe, ...(ticker === 'BBCA' ? { source: 'Yahoo Finance fundamentals timeseries API (unofficial; verify before acting)', period: 'FY2025 annual financial statements', retrievedAt } : {}) },
}))

export const market = { name: 'IHSG', price: 6436.85, oneWeek: -3.61, oneMonth: 0.55, ma20: 6547.1, ma50: 6342.18, updatedAt: retrievedAt, source }
export const dataNotice = 'Price history is bundled from a 16 Sep 2026 capture. Yahoo Finance is an unofficial convenience source and may be delayed, incomplete, or unavailable. Fundamental data is intentionally unavailable unless a traceable source and reporting period are recorded.'
