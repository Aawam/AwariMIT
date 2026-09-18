# Data

## BBCA period-aware fundamentals

AwariMIT retains two independent issuer snapshots for BBCA. They must not be compared as if they cover the same duration.

- Latest interim: H1 2026, six months ended 30 June 2026; unaudited; published 28 July 2026; consolidated; source: [BCA Financial Report June 2026](https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Triwulan/2026/20260728-financial-report-june-2026.pdf).
- Annual reference: FY2025, year ended 31 December 2025; published 12 February 2026; consolidated; source: [BCA Annual Report 2025](https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf).

The H1 report provides total assets, total equity, net interest income, operating profit, and net profit in IDR billion. Its H1 net-profit growth is a derived calculation using the H1 2026 and H1 2025 consolidated figures reported in the same filing. FY2025 ROA, ROE, EPS, P/E, and P/BV remain annual-reference values; they are not presented as H1 values.

Each snapshot records reporting period, publication date, retrieval timestamp, source URL, source quality, consolidation basis, metric unit, and whether each metric is REPORTED or DERIVED. Publication date is the primary fundamental-freshness signal; retrieval timestamp describes when AwariMIT captured the source.

## Market history and refresh

BBCA contains 244 bundled daily HLCV sessions from 18 September 2025 through 18 September 2026. The legacy bundle does not retain the source open field, so it is not represented as full OHLCV. The source is Yahoo Finance’s public chart endpoint for `BBCA.JK`, classified as PUBLIC_SECONDARY prototype convenience data. It is not an IDX entitlement or live feed.

Run `npm run data:update` to view the current refresh status. To normalize a reviewed local JSON capture:

```text
npm run data:update -- --input /absolute/path/bbca.json --output src/data/bbcaPriceBars.ts
```

The command does not fetch providers, scrape pages, bypass rate limits, or use credentials. New input requires full OHLCV and validates ticker, source, retrieval timestamp, ordered dates, finite values, non-negative volume, and basic high/low consistency before atomically replacing the output. Invalid, empty, unreadable, or rate-limited input returns FAILED and leaves the prior valid output in place. Identical normalized content returns UNCHANGED.

## Issuer events

`NewsProvider` currently presents official issuer filing facts and issuer events, not live news. Every record includes its publication date and source URL. No market outcome or trade signal is inferred.

## Deferred cross-sector validation

V0.3B is DEFERRED. The proposed TLKM reference stock had traceable official fundamentals but no sufficiently reproducible OHLCV capture during V0.3 work because available public endpoints rate-limited or returned anti-bot challenges. No substitute stock or fabricated data was used.

## Constraints

IDX automated access returned HTTP 403 from this environment. No paid source, credential, API key, or unclear-provider integration was added. A licensed/authorized production market provider remains future work.
