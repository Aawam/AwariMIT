import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { safelyWriteSnapshot } from './refresh-market-snapshot.mjs'

const sourceUrl = 'https://www.telkom.co.id/minio/show/data/lampiran/1785496444169_original_Telkom-FS-English-TW-II-2026.pdf'
const reportName = 'PT Telekomunikasi Indonesia Tbk. and its subsidiaries, Consolidated Financial Statements 2Q 2026'
const ticker = 'TLKM'
const pythonExtract = `
import json
import sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
json.dump([reader.pages[index].extract_text() or "" for index in (2, 3, 4, 7)], sys.stdout)
`

function failure(message) {
  return { status: 'FAILED', errors: [message] }
}

function runPython(command, args) {
  return new Promise(resolve => {
    const child = spawn(command, args)
    let stdout = ''; let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', error => resolve({ exitCode: null, stdout, stderr, error }))
    child.on('close', exitCode => resolve({ exitCode, stdout, stderr }))
  })
}

function requiredNumber(text, expression, key) {
  const match = text.match(expression)
  if (!match) throw new Error(`Missing reported ${key}.`)
  const value = Number(match[1].replaceAll(',', ''))
  if (!Number.isFinite(value)) throw new Error(`Invalid reported ${key}.`)
  return value
}

function publicationDate(text) {
  const match = text.match(/Jakarta,\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/)
  if (!match) throw new Error('Missing report issue date.')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${match[3]}-${String(months.indexOf(match[1]) + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

export function normalizeTelkomH12026Pages(pages, retrievedAt = new Date().toISOString()) {
  if (!Array.isArray(pages) || pages.length !== 4 || pages.some(page => typeof page !== 'string')) return failure('Official Telkom PDF extraction returned incomplete pages.')
  const [statement, position, profitLoss, cashFlow] = pages
  try {
    if (!statement.toUpperCase().includes('CONSOLIDATED FINANCIAL STATEMENTS') || !statement.toLowerCase().includes('six-month period then ended')) throw new Error('PDF is not the expected TLKM H1 2026 consolidated report.')
    if (!position.includes('June 30, 2026') || !profitLoss.includes('For the Six Months Period Ended June 30, 2026 and 2025')) throw new Error('PDF reporting period does not match H1 2026.')
    const issuedOn = publicationDate(statement)
    return {
      ticker,
      reportingPeriod: 'H1 2026, six months ended 30 June 2026',
      periodType: 'H1',
      publicationDate: issuedOn,
      retrievedAt,
      source: `${reportName}, consolidated statements, pp. 1–5`,
      sourceUrl,
      sourceQuality: 'OFFICIAL_ISSUER',
      consolidation: 'Consolidated',
      metrics: [
        { key: 'totalAssets', name: 'Total assets', value: requiredNumber(position, /TOTAL ASSETS\s+([\d,]+)/, 'total assets'), unit: 'IDR billion', status: 'REPORTED' },
        { key: 'totalEquity', name: 'Total equity', value: requiredNumber(position, /TOTAL EQUITY\s+([\d,]+)/, 'total equity'), unit: 'IDR billion', status: 'REPORTED' },
        { key: 'revenue', name: 'Revenue', value: requiredNumber(profitLoss, /REVENUES\s+[\d,]+\s+([\d,]+)/, 'revenue'), unit: 'IDR billion', status: 'REPORTED' },
        { key: 'operatingProfit', name: 'Operating profit', value: requiredNumber(profitLoss, /OPERATING PROFIT\s+([\d,]+)/, 'operating profit'), unit: 'IDR billion', status: 'REPORTED' },
        { key: 'netProfit', name: 'Profit for the period', value: requiredNumber(profitLoss, /PROFIT FOR THE PERIOD\s+([\d,]+)/, 'profit for the period'), unit: 'IDR billion', status: 'REPORTED' },
        { key: 'basicEps', name: 'Basic earnings per share', value: requiredNumber(profitLoss, /Profit per share\s+([\d.]+)/, 'basic earnings per share'), unit: 'IDR per share', status: 'REPORTED' },
        { key: 'operatingCashFlow', name: 'Net cash provided by operating activities', value: requiredNumber(cashFlow, /Net cash provided by operating activities\s+([\d,]+)/, 'operating cash flow'), unit: 'IDR billion', status: 'REPORTED' },
      ],
    }
  } catch (error) {
    return failure(error instanceof Error ? error.message : String(error))
  }
}

export function validateFundamentalSnapshot(snapshot, expectedTicker) {
  const errors = []
  if (!snapshot || typeof snapshot !== 'object') return ['Fundamental snapshot must be an object.']
  if (!/^[A-Z]{2,8}$/.test(snapshot.ticker ?? '')) errors.push('ticker must be an uppercase IDX-style symbol.')
  if (expectedTicker && snapshot.ticker !== expectedTicker) errors.push(`ticker ${snapshot.ticker ?? 'missing'} does not match expected ticker ${expectedTicker}.`)
  if (!['Q1', 'H1', '9M', 'FY'].includes(snapshot.periodType)) errors.push('periodType must be Q1, H1, 9M, or FY.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.publicationDate ?? '')) errors.push('publicationDate must be an ISO date.')
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(snapshot.retrievedAt ?? '')) errors.push('retrievedAt must be an ISO UTC timestamp.')
  for (const key of ['reportingPeriod', 'source', 'sourceUrl', 'sourceQuality', 'consolidation']) if (typeof snapshot[key] !== 'string' || !snapshot[key].trim()) errors.push(`${key} is required.`)
  if (!['OFFICIAL_ISSUER', 'PUBLIC_SECONDARY'].includes(snapshot.sourceQuality)) errors.push('sourceQuality is invalid.')
  if (!['Consolidated', 'Parent-only'].includes(snapshot.consolidation)) errors.push('consolidation is invalid.')
  if (!Array.isArray(snapshot.metrics) || snapshot.metrics.length === 0) errors.push('metrics must be a non-empty array.')
  for (const [index, metric] of (snapshot.metrics ?? []).entries()) {
    const prefix = `metrics[${index}]`
    if (!/^[a-z][A-Za-z0-9]*$/.test(metric.key ?? '')) errors.push(`${prefix}.key must be a lower camel-case metric key.`)
    if (typeof metric.name !== 'string' || !metric.name.trim()) errors.push(`${prefix}.name is required.`)
    if (typeof metric.value !== 'number' || !Number.isFinite(metric.value)) errors.push(`${prefix}.value must be finite.`)
    if (typeof metric.unit !== 'string' || !metric.unit.trim()) errors.push(`${prefix}.unit is required.`)
    if (!['REPORTED', 'DERIVED'].includes(metric.status)) errors.push(`${prefix}.status is invalid.`)
  }
  return errors
}

export function renderFundamentalSnapshot(snapshot, exportName = 'tlkmH12026Snapshot') {
  return `// Generated by scripts/capture-telkom-fundamentals.mjs from an official issuer PDF.\nimport type { FundamentalSnapshot } from '../domain/types'\n\nexport const ${exportName}: FundamentalSnapshot = ${JSON.stringify(snapshot, null, 2)}\n`
}

export async function updateFundamentalSnapshot(snapshot, outputPath, expectedTicker = ticker) {
  const errors = validateFundamentalSnapshot(snapshot, expectedTicker)
  if (errors.length) return { status: 'FAILED', errors }
  return { status: await safelyWriteSnapshot(outputPath, renderFundamentalSnapshot(snapshot)) }
}

export async function captureTelkomH12026Fundamentals({ python = process.env.AWARIMIT_FUNDAMENTALS_PYTHON ?? 'python3', retrievedAt, extract = runPython, fetchDocument = fetch } = {}) {
  let response
  try { response = await fetchDocument(sourceUrl) } catch (error) { return failure(`Unable to fetch Telkom report: ${error instanceof Error ? error.message : String(error)}`) }
  if (!response.ok) return failure(`Telkom report returned HTTP ${response.status}.`)
  const contentType = response.headers?.get?.('content-type') ?? ''
  if (!contentType.includes('pdf')) return failure('Telkom report did not return a PDF.')
  const directory = await mkdtemp(join(tmpdir(), 'awarimit-tlkm-fundamentals-'))
  const input = join(directory, 'tlkm-h1-2026.pdf')
  try {
    await writeFile(input, Buffer.from(await response.arrayBuffer()))
    const result = await extract(python, ['-c', pythonExtract, input])
    if (result.error || result.exitCode !== 0) return failure(`PDF extraction failed${result.stderr ? `: ${result.stderr.trim()}` : '.'}`)
    let pages
    try { pages = JSON.parse(result.stdout) } catch { return failure('PDF extractor returned malformed JSON.') }
    return normalizeTelkomH12026Pages(pages, retrievedAt)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function main() {
  const outputIndex = process.argv.indexOf('--output')
  if (outputIndex === -1) {
    console.log('Usage: npm run data:fetch:telkom-fundamentals -- --output src/data/tlkmFundamentalSnapshot.ts')
    process.exitCode = 1
    return
  }
  const snapshot = await captureTelkomH12026Fundamentals()
  if (snapshot.status === 'FAILED') {
    console.log(`TLKM fundamentals: ${snapshot.status}`)
    for (const error of snapshot.errors) console.log(`- ${error}`)
    process.exitCode = 1
    return
  }
  const result = await updateFundamentalSnapshot(snapshot, process.argv[outputIndex + 1])
  if (result.status === 'FAILED') {
    console.log('TLKM fundamentals: FAILED')
    for (const error of result.errors) console.log(`- ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`TLKM fundamentals: ${result.status}`)
  console.log(`period: ${snapshot.reportingPeriod}`)
  console.log(`publication: ${snapshot.publicationDate}`)
  console.log(`metrics: ${snapshot.metrics.length}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
