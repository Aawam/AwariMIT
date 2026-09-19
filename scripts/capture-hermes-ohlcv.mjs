import { spawn } from 'node:child_process'
import { delimiter, resolve } from 'node:path'
import { updateFromSnapshot } from './refresh-market-snapshot.mjs'

const tickerPattern = /^[A-Z]{2,8}$/
const source = 'Yahoo Finance via jagres0039/hermes-market-skills'

const pythonCapture = `
import json
import sys
from skills.saham_idn.feeds import normalize_ticker, ohlcv

symbol = sys.argv[1]
df = ohlcv(symbol, timeframe="1d")
rows = []
for index, row in df.iterrows():
    rows.append({
        "date": index.strftime("%Y-%m-%d"),
        "open": float(row["open"]),
        "high": float(row["high"]),
        "low": float(row["low"]),
        "close": float(row["close"]),
        "volume": float(row["volume"]),
    })
json.dump({"ticker": normalize_ticker(symbol), "bars": rows}, sys.stdout)
`

function failure(message) {
  return { status: 'FAILED', errors: [message] }
}

function runPython(command, args, environment) {
  return new Promise(resolveRun => {
    const child = spawn(command, args, { env: environment })
    let stdout = ''; let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', error => resolveRun({ exitCode: null, stdout, stderr, error }))
    child.on('close', exitCode => resolveRun({ exitCode, stdout, stderr }))
  })
}

export function normalizeHermesOhlcvPayload(payload, ticker, retrievedAt = new Date().toISOString()) {
  if (!tickerPattern.test(ticker)) return failure('ticker must be an uppercase IDX-style symbol.')
  if (!payload || typeof payload !== 'object') return failure('Hermes market skill returned no JSON object.')
  if (payload.ticker !== `${ticker}.JK`) return failure(`Hermes market skill ticker ${payload.ticker ?? 'missing'} does not match requested ${ticker}.JK.`)
  if (!Array.isArray(payload.bars) || payload.bars.length === 0) return failure('Hermes market skill returned no daily OHLCV bars.')
  return {
    ticker,
    source,
    sourceUrl: `https://finance.yahoo.com/quote/${ticker}.JK/history`,
    attribution: 'Yahoo Finance data retrieved through the MIT-licensed hermes-market-skills saham_idn feed.',
    exportedAt: retrievedAt,
    retrievedAt,
    interval: '1d',
    currency: 'IDR',
    bars: payload.bars.map(bar => ({ date: bar.date, open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: bar.volume })),
  }
}

export async function captureHermesOhlcv(ticker, { python = process.env.AWARIMIT_HERMES_MARKET_PYTHON ?? 'python3', skillRoot = process.env.AWARIMIT_HERMES_MARKET_SKILLS_ROOT, retrievedAt, execute = runPython } = {}) {
  if (!tickerPattern.test(ticker)) return failure('ticker must be an uppercase IDX-style symbol.')
  if (!skillRoot) return failure('AWARIMIT_HERMES_MARKET_SKILLS_ROOT must point to a hermes-market-skills checkout.')
  const environment = { ...process.env, PYTHONPATH: [resolve(skillRoot), process.env.PYTHONPATH].filter(Boolean).join(delimiter) }
  const result = await execute(python, ['-c', pythonCapture, ticker], environment)
  if (result.error || result.exitCode !== 0) return failure(`Hermes market skill failed${result.stderr ? `: ${result.stderr.trim()}` : '.'}`)
  let payload
  try { payload = JSON.parse(result.stdout) } catch { return failure('Hermes market skill returned malformed JSON.') }
  return normalizeHermesOhlcvPayload(payload, ticker, retrievedAt)
}

async function main() {
  const tickerIndex = process.argv.indexOf('--ticker'); const outputIndex = process.argv.indexOf('--output')
  if (tickerIndex === -1 || outputIndex === -1) {
    console.log('Usage: npm run data:fetch:hermes -- --ticker TICKER --output src/data/tickerPriceBars.ts')
    process.exitCode = 1
    return
  }
  const ticker = process.argv[tickerIndex + 1]
  const snapshot = await captureHermesOhlcv(ticker)
  if (snapshot.status === 'FAILED') {
    console.log(`Market capture: ${snapshot.status}`)
    for (const error of snapshot.errors) console.log(`- ${error}`)
    process.exitCode = 1
    return
  }
  const result = await updateFromSnapshot(snapshot, process.argv[outputIndex + 1], ticker)
  console.log(`${result.ticker ?? 'Market'} capture: ${result.status}`)
  if (result.status === 'FAILED') {
    for (const error of result.errors) console.log(`- ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`sessions: ${result.sessions}`)
  console.log(`latest: ${result.latestSession}`)
  console.log(`snapshot: ${result.digest}`)
  console.log('Fundamentals and events: UNCHANGED (market capture does not fetch or alter them)')
}

if (import.meta.url === `file://${process.argv[1]}`) main()
