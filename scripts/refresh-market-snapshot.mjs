import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'

const isoDate = /^\d{4}-\d{2}-\d{2}$/
const isoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
const number = value => typeof value === 'number' && Number.isFinite(value)

function csvRow(line) {
  const values = []; let value = ''; let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') { if (quoted && line[index + 1] === '"') { value += '"'; index += 1 } else quoted = !quoted }
    else if (character === ',' && !quoted) { values.push(value.trim()); value = '' }
    else value += character
  }
  values.push(value.trim())
  return quoted ? null : values
}

function metadataSnapshot(metadata, bars) {
  return {
    ticker: metadata.ticker,
    source: metadata.source,
    sourceUrl: metadata.sourceUrl,
    attribution: metadata.attribution,
    exportedAt: metadata.exportedAt,
    retrievedAt: metadata.retrievedAt,
    interval: metadata.interval,
    currency: metadata.currency,
    bars,
  }
}

export function normalizeCsvCapture(raw) {
  const metadata = {}; const lines = raw.split(/\r?\n/); let header = null; const data = []
  for (const line of lines) {
    if (!line.trim()) continue
    if (line.startsWith('#')) {
      const separator = line.indexOf(':')
      if (separator === -1) return { errors: [`Invalid metadata line: ${line}`] }
      const key = line.slice(1, separator).trim().toLowerCase().replaceAll('-', '_')
      metadata[key] = line.slice(separator + 1).trim()
      continue
    }
    if (header === null) { header = csvRow(line)?.map(value => value.toLowerCase()); if (!header) return { errors: ['CSV header has unmatched quotes.'] }; continue }
    const row = csvRow(line)
    if (!row || row.length !== header.length) return { errors: ['CSV row has unmatched quotes or does not match the header.'] }
    data.push(Object.fromEntries(header.map((key, index) => [key, row[index]])))
  }
  if (!header) return { errors: ['CSV requires metadata comments and a header row.'] }
  const requiredColumns = ['date', 'open', 'high', 'low', 'close', 'volume']
  const missingColumns = requiredColumns.filter(column => !header.includes(column))
  if (missingColumns.length) return { errors: [`CSV is missing columns: ${missingColumns.join(', ')}.`] }
  const bars = data.map(row => Object.fromEntries(requiredColumns.map(key => [key, key === 'date' ? row[key] : row[key] === '' ? null : Number(row[key]) ])))
  return { snapshot: metadataSnapshot({ ticker: metadata.ticker, source: metadata.source, sourceUrl: metadata.source_url, attribution: metadata.attribution, exportedAt: metadata.exported_at, retrievedAt: metadata.retrieved_at, interval: metadata.interval, currency: metadata.currency }, bars) }
}

export function validateMarketSnapshot(snapshot, expectedTicker) {
  const errors = []
  if (!snapshot || typeof snapshot !== 'object') return ['Snapshot must be an object.']
  if (!/^[A-Z]{2,8}$/.test(snapshot.ticker ?? '')) errors.push('ticker must be an uppercase IDX-style symbol.')
  if (expectedTicker && snapshot.ticker !== expectedTicker) errors.push(`ticker ${snapshot.ticker ?? 'missing'} does not match expected ticker ${expectedTicker}.`)
  for (const key of ['source', 'sourceUrl', 'attribution', 'exportedAt', 'retrievedAt', 'interval', 'currency']) if (typeof snapshot[key] !== 'string' || !snapshot[key].trim()) errors.push(`${key} is required.`)
  if (!isoTimestamp.test(snapshot.exportedAt ?? '')) errors.push('exportedAt must be an ISO UTC timestamp.')
  if (!isoTimestamp.test(snapshot.retrievedAt ?? '')) errors.push('retrievedAt must be an ISO UTC timestamp.')
  if (snapshot.interval !== '1d') errors.push('interval must be 1d.')
  if (!Array.isArray(snapshot.bars) || snapshot.bars.length === 0) errors.push('bars must be a non-empty array.')
  let priorDate = ''
  for (const [index, bar] of (snapshot.bars ?? []).entries()) {
    const prefix = `bars[${index}]`
    if (!isoDate.test(bar.date ?? '') || Number.isNaN(Date.parse(`${bar.date}T00:00:00Z`))) errors.push(`${prefix}.date must be a valid trading date.`)
    if (bar.date <= priorDate) errors.push(`${prefix}.date must be strictly ordered with no duplicates.`)
    priorDate = bar.date ?? priorDate
    for (const key of ['open', 'high', 'low', 'close', 'volume']) if (!number(bar[key])) errors.push(`${prefix}.${key} must be finite.`)
    for (const key of ['open', 'high', 'low', 'close']) if (number(bar[key]) && bar[key] <= 0) errors.push(`${prefix}.${key} must be greater than zero.`)
    if (number(bar.volume) && bar.volume < 0) errors.push(`${prefix}.volume must be non-negative.`)
    if (number(bar.high) && number(bar.low) && bar.high < bar.low) errors.push(`${prefix}.high must not be below low.`)
    if (number(bar.open) && number(bar.close) && number(bar.high) && bar.high < Math.max(bar.open, bar.close)) errors.push(`${prefix}.high must be at least open and close.`)
    if (number(bar.open) && number(bar.close) && number(bar.low) && bar.low > Math.min(bar.open, bar.close)) errors.push(`${prefix}.low must not exceed open or close.`)
  }
  return errors
}

export function renderSnapshot(snapshot) {
  const bars = snapshot.bars.map(({ date, open, high, low, close, volume }) => `  { date: '${date}', open: ${open}, high: ${high}, low: ${low}, close: ${close}, volume: ${volume} },`).join('\n')
  return `// Generated by scripts/refresh-market-snapshot.mjs from a reviewed portable capture.\n// Source: ${snapshot.source}\n// Source URL: ${snapshot.sourceUrl}\n// Attribution: ${snapshot.attribution}\n// Exported: ${snapshot.exportedAt}\n// Retrieved: ${snapshot.retrievedAt}\n// Interval: ${snapshot.interval}; Currency: ${snapshot.currency}\nexport const ${snapshot.ticker.toLowerCase()}PriceBars = [\n${bars}\n] as const\n`
}

export async function safelyWriteSnapshot(outputPath, content) {
  const resolved = resolve(outputPath)
  let existing = null
  try { existing = await readFile(resolved, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
  if (existing === content) return 'UNCHANGED'
  await mkdir(dirname(resolved), { recursive: true })
  const temporary = `${resolved}.tmp-${process.pid}`
  try { await writeFile(temporary, content, 'utf8'); await stat(temporary); await rename(temporary, resolved) } catch (error) { await unlink(temporary).catch(() => undefined); throw error }
  return 'UPDATED'
}

export async function updateFromSnapshot(snapshot, outputPath, expectedTicker) {
  const errors = validateMarketSnapshot(snapshot, expectedTicker)
  if (errors.length) return { status: 'FAILED', errors }
  const content = renderSnapshot(snapshot)
  const status = await safelyWriteSnapshot(outputPath, content)
  const digest = createHash('sha256').update(content).digest('hex').slice(0, 12)
  return { status, ticker: snapshot.ticker, sessions: snapshot.bars.length, latestSession: snapshot.bars.at(-1).date, digest }
}

export async function updateFromInput(inputPath, outputPath, expectedTicker) {
  let raw
  try { raw = await readFile(resolve(inputPath), 'utf8') } catch (error) { return { status: 'FAILED', errors: [`Unable to read input: ${error.message}`] } }
  let snapshot
  if (extname(inputPath).toLowerCase() === '.csv') {
    const normalized = normalizeCsvCapture(raw)
    if (normalized.errors) return { status: 'FAILED', errors: normalized.errors }
    snapshot = normalized.snapshot
  } else {
    try { snapshot = JSON.parse(raw) } catch { return { status: 'FAILED', errors: ['Input is not valid JSON. Use .csv for portable CSV input.'] } }
  }
  return updateFromSnapshot(snapshot, outputPath, expectedTicker)
}

async function main() {
  const inputIndex = process.argv.indexOf('--input'); const outputIndex = process.argv.indexOf('--output'); const tickerIndex = process.argv.indexOf('--ticker')
  console.log('AwariMIT reviewed market-capture ingestion')
  if (inputIndex === -1 || outputIndex === -1) {
    console.log('Market capture: SKIPPED (no reviewed input capture supplied)')
    console.log('No provider was fetched. Existing per-stock fundamentals and events are unchanged.')
    console.log('Usage: npm run data:ingest -- --ticker TICKER --input /path/TICKER.json|csv --output src/data/tickerPriceBars.ts')
    return
  }
  const result = await updateFromInput(process.argv[inputIndex + 1], process.argv[outputIndex + 1], tickerIndex === -1 ? undefined : process.argv[tickerIndex + 1])
  console.log(`${result.ticker ?? 'Market'} capture: ${result.status}`)
  if (result.status === 'FAILED') { for (const error of result.errors) console.log(`- ${error}`); process.exitCode = 1; return }
  console.log(`sessions: ${result.sessions}`); console.log(`latest: ${result.latestSession}`); console.log(`snapshot: ${result.digest}`)
  console.log('Fundamentals and events: UNCHANGED (market ingestion does not fetch or alter them)')
}

if (import.meta.url === `file://${process.argv[1]}`) main()
