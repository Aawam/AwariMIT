# Data

Price bars and IHSG values were captured from Yahoo Finance's chart endpoint on 16 September 2026 UTC. It is an unofficial source, subject to delay, terms and availability; it is not a production data entitlement. Each price object carries source, retrieval timestamp, period and unit.

The capture covers BBCA, BMRI, TLKM, ASII, ANTM and IHSG only. Sector labels are company classifications. BBCA's FY2025 revenue growth, ROE, debt/equity and P/E are derived from Yahoo Finance's fundamentals-timeseries endpoint and labelled with source and period. Other financial, corporate-action, news, foreign-flow, spread and volume-history data remain unavailable unless a dated source is recorded.

## News boundary

`NewsProvider` is a small adapter interface. V0.1 uses a clearly labelled bundled sample fixture, not a live feed. Every item has title, publisher, published timestamp, URL, ticker, category, relevance, sentiment and source type. The fixture must not be interpreted as current market news. IDX access returned HTTP 403 and Yahoo financial-summary access returned HTTP 401 in this environment.
