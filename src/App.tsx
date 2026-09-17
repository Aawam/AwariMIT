import { useMemo, useState } from 'react'
import { rankStocks } from './analytics/screening'
import { scoringNotes } from './config/screening'
import { dataNotice, market, stocks } from './data/marketData'
import type { ScreeningResult } from './domain/types'
import './App.css'

const idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const pct = (value: number | null) => value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
const score = (value: number | null) => value === null ? '—' : value.toFixed(0)

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${36 - ((value - min) / range) * 32}`).join(' ')
  return <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label="40 trading-day closing-price path"><polyline points={points} /></svg>
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className="metric"><span>{label}</span><strong className={emphasis ? 'accent' : ''}>{value}</strong></div>
}

function Detail({ stock, onBack }: { stock: ScreeningResult; onBack: () => void }) {
  const s = stock.score
  return <main className="page detail-page">
    <button className="back" onClick={onBack}>← Back to screener</button>
    <section className="stock-title"><div><p className="eyebrow">{stock.sector}</p><h1>{stock.ticker}</h1><p>{stock.name}</p></div><div className="score-pill"><span>AwariMIT Score</span><strong>{score(s.total)}</strong><small>{stock.status}</small></div></section>
    <section className="card chart-card"><div><p className="eyebrow">40-session closing-price path</p><h2>Rp {idr.format(stock.price.value ?? 0)}</h2><p className={stock.dailyChange && stock.dailyChange >= 0 ? 'positive' : 'negative'}>{pct(stock.dailyChange)} last session</p></div><Sparkline values={stock.priceHistory} /><p className="muted">MA20 Rp {idr.format(stock.technical.ma20 ?? 0)} · MA50 Rp {idr.format(stock.technical.ma50 ?? 0)}</p></section>
    <section className="detail-grid"><article className="card"><h2>Why it is on the screen</h2><ul>{stock.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></article><article className="card warning"><h2>Counter-thesis & risks</h2><ul>{stock.risks.map(risk => <li key={risk}>{risk}</li>)}</ul><p><b>Invalidation context:</b> A close persistently below MA50 weakens this short-term trend view; this is a monitoring condition, not an automatic sell signal.</p></article></section>
    <section className="detail-grid"><article className="card"><h2>Technical & liquidity</h2><div className="metric-grid"><Metric label="1 week" value={pct(stock.technical.oneWeek)} /><Metric label="1 month" value={pct(stock.technical.oneMonth)} /><Metric label="3 months" value={pct(stock.technical.threeMonth)} /><Metric label="Avg. traded value" value={`Rp ${(stock.averageTradedValue ?? 0 / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })}B`} /></div></article><article className="card"><h2>Fundamental snapshot</h2><div className="metric-grid"><Metric label="Revenue growth" value={pct(stock.fundamentals.revenueGrowth)} /><Metric label="ROE" value={pct(stock.fundamentals.roe)} /><Metric label="Debt / equity" value={stock.fundamentals.debtToEquity?.toFixed(2) ?? 'Unavailable'} /><Metric label="P/E" value={stock.fundamentals.pe?.toFixed(1) ?? 'Unavailable'} /></div><p className="muted">{stock.fundamentals.source ? `${stock.fundamentals.source}; ${stock.fundamentals.period}; retrieved ${new Date(stock.fundamentals.retrievedAt ?? '').toLocaleDateString('id-ID')}.` : 'Unavailable metrics are omitted from scoring, not assumed to be zero.'}</p></article></section>
    <section className="card"><h2>Score evidence</h2><div className="factor-grid">{Object.entries(s).filter(([key]) => !['total', 'availableWeight'].includes(key)).map(([key, value]) => <Metric key={key} label={key} value={score(value as number | null)} />)}</div><p className="muted">{scoringNotes} Active evidence weights: {s.availableWeight}%.</p></section>
    <section className="source"><h2>Data source & limitations</h2><p>{dataNotice}</p><p>Source: {stock.price.source}. Retrieved: {new Date(stock.price.retrievedAt).toLocaleString('id-ID')}.</p></section>
  </main>
}

function App() {
  const [page, setPage] = useState<'dashboard' | 'screener' | 'methodology'>('dashboard')
  const [selected, setSelected] = useState<ScreeningResult | null>(null)
  const [query, setQuery] = useState('')
  const [minScore, setMinScore] = useState(0)
  const results = useMemo(() => rankStocks(stocks), [])
  const filtered = results.filter(stock => (stock.ticker + stock.name + stock.sector).toLowerCase().includes(query.toLowerCase()) && (stock.score.total ?? 0) >= minScore)
  const open = (stock: ScreeningResult) => { setSelected(stock); setPage('screener') }
  if (selected) return <><Header page={page} setPage={setPage} clear={() => setSelected(null)} /><Detail stock={selected} onBack={() => setSelected(null)} /></>
  return <><Header page={page} setPage={setPage} clear={() => undefined} />
    {page === 'dashboard' && <main className="page"><section className="hero"><p className="eyebrow">INDONESIA MARKET · SHORT-TERM RESEARCH</p><h1>Understand the market<br />before acting.</h1><p className="lede">An explainable starting point for a small, liquid IDX universe. It supports research; it does not make investment decisions.</p></section><section className="market-grid"><article className="card"><p className="eyebrow">Market pulse</p><h2>{market.name}</h2><strong className="market-price">{market.price.toLocaleString('id-ID')}</strong><p className="negative">{pct(market.oneWeek)} · 1 week</p></article><article className="card"><p className="eyebrow">Transparent regime</p><h2>Sideways / cautious</h2><p>IHSG is below MA20 but above MA50. This simple rule does not measure breadth or flows.</p></article><article className="card"><p className="eyebrow">Coverage</p><h2>{stocks.length} liquid names</h2><p>Seed universe across Financials, Telecom, Industrials and Materials. Expand only after provider validation.</p></article></section><section className="section-head"><div><p className="eyebrow">OPPORTUNITIES</p><h2>Screened candidates</h2></div><button className="text-button" onClick={() => setPage('screener')}>Open screener →</button></section><CandidateTable rows={results.slice(0, 4)} open={open} /></main>}
    {page === 'screener' && <main className="page"><section className="section-head"><div><p className="eyebrow">SCREENER</p><h1>Candidate quality, explained.</h1><p className="lede">Sort through the initial liquid universe using deterministic price, trend, liquidity, risk and available fundamental evidence.</p></div></section><div className="filters"><label>Search<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ticker or company" /></label><label>Minimum score<select value={minScore} onChange={event => setMinScore(Number(event.target.value))}><option value={0}>All</option><option value={50}>50+</option><option value={60}>60+</option></select></label></div><CandidateTable rows={filtered} open={open} /></main>}
    {page === 'methodology' && <main className="page prose"><p className="eyebrow">METHODOLOGY</p><h1>Evidence before claims.</h1><h2>What the score measures</h2><p>{scoringNotes}</p><p>Configured starting weights: Momentum 25%, Technical structure 20%, Fundamental quality 20%, Liquidity 15%, Valuation 10%, and Risk 10%. They are a documented hypothesis, not validated alpha.</p><h2>How to use it</h2><p>Use the score to prioritize research. Open a name to inspect evidence, counter-evidence, timestamps and missing fields. A high score is neither a buy signal nor a probability of profit.</p><h2>Data limitations</h2><p>{dataNotice}</p></main>}
  </>
}

function Header({ page, setPage, clear }: { page: string; setPage: (page: 'dashboard' | 'screener' | 'methodology') => void; clear: () => void }) { return <header><button className="brand" onClick={() => { clear(); setPage('dashboard') }}>AWARIMIT <span>Market Intelligence Tools</span></button><nav>{(['dashboard', 'screener', 'methodology'] as const).map(item => <button className={page === item ? 'active' : ''} key={item} onClick={() => { clear(); setPage(item) }}>{item}</button>)}</nav></header> }
function CandidateTable({ rows, open }: { rows: ScreeningResult[]; open: (stock: ScreeningResult) => void }) { return <div className="table-wrap"><table><thead><tr><th>Company</th><th>Price</th><th>3M momentum</th><th>Liquidity</th><th>Risk</th><th>Score</th><th>Status</th></tr></thead><tbody>{rows.map(stock => <tr key={stock.ticker} onClick={() => open(stock)}><td><b>{stock.ticker}</b><span>{stock.name}</span></td><td>Rp {idr.format(stock.price.value ?? 0)}<span className={stock.dailyChange && stock.dailyChange >= 0 ? 'positive' : 'negative'}>{pct(stock.dailyChange)}</span></td><td className={stock.technical.threeMonth && stock.technical.threeMonth >= 0 ? 'positive' : 'negative'}>{pct(stock.technical.threeMonth)}</td><td>{score(stock.score.liquidity)}</td><td>{score(stock.score.risk)}</td><td><b className="score-number">{score(stock.score.total)}</b></td><td><span className="status">{stock.status}</span></td></tr>)}</tbody></table>{rows.length === 0 && <p className="empty">No stocks match these filters.</p>}</div> }
export default App