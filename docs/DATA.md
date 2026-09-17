# Data

Price bars and IHSG values were captured from Yahoo Finance's chart endpoint on 16 September 2026 UTC. It is an unofficial source, subject to delay, terms and availability; it is not a production data entitlement. Each price object carries source, retrieval timestamp, period and unit.

The capture covers BBCA, BMRI, TLKM, ASII, ANTM and IHSG only. Sector labels are company classifications. BBCA's FY2025 revenue growth, ROE, debt/equity and P/E are derived from Yahoo Finance's fundamentals-timeseries endpoint and are labelled with source and period. Financial, corporate-action, news, foreign-flow and spread data for the remaining names are unavailable unless a dated source is recorded. IDX access returned HTTP 403 from this environment; Yahoo financial-summary access returned HTTP 401. The UI deliberately shows unavailable values rather than inventing them.
