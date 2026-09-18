# Data

## V0.2 reference stock: BBCA

V0.2 deliberately focuses on BBCA rather than expanding partial coverage. The repository bundles 244 daily OHLCV sessions from 18 September 2025 through 18 September 2026, captured at 2026-09-18T02:46:57Z from Yahoo Finance's public chart endpoint for `BBCA.JK`. This source is an unofficial convenience source, not an IDX entitlement; the UI marks it static and displays the capture timestamp.

FY2025 fundamentals and company-event facts are from BCA's issuer-published [Annual Report 2025](https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf), published 12 February 2026. The app records its period, source URL and retrieval time. The report supplies total assets, equity, operating income, net income, net-income growth, EPS, ROA, ROE, P/E, P/BV and year-end market capitalization.

## Provider boundary

`NewsProvider` remains a small adapter boundary. BBCA currently uses official issuer filings, not a live-news service. News cards are reported filing facts with title, publisher, publication date, URL, category, relevance and conservative Neutral sentiment. No market interpretation is generated.

## Constraints

IDX automated access returned HTTP 403 from this environment. No paid source, credential, API key or unclear provider integration was added. BBCA market data will become stale until an authorized provider is selected; timestamps make that visible rather than hiding it.
