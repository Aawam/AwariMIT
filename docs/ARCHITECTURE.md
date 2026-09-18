# Architecture

React + TypeScript + Vite serves a static client application. `src/data` contains period-aware issuer snapshots and validated market captures; `src/analytics` is UI-independent deterministic calculation; `src/config` contains scoring weights and confidence thresholds; `src/domain` contains the data contract; and `src/App.tsx` presents results.

ADR-001: Use bundled captures for V0. The provider boundary keeps a licensed server-side provider replaceable. No credentials are embedded.

ADR-002: No database, backend, AI, queues or chart dependency. An SVG price path is sufficient for the first vertical slice.

ADR-003: Keep Composite Score, Evidence Coverage and Confidence separate. Score can normalize missing factors, but coverage preserves how much configured evidence is actually represented. Status gating prevents a sparse high score from becoming Strong Candidate.

ADR-004: Use a `NewsProvider` boundary. BBCA has issuer-published filing facts; no untraceable fixture or AI narrative is presented as news.

ADR-005: BBCA is the reference stock. `src/data/bbcaPriceBars.ts` contains raw captured OHLCV history; `marketData.ts` derives moving averages, returns, relative volume, ATR and volatility deterministically.

ADR-006: `src/data/fundamentals.ts` keeps an H1 2026 snapshot and a separate FY2025 annual reference. Every snapshot has reporting period, period type, publication date, retrieval time, source quality, consolidation basis, source URL and REPORTED/DERIVED metric status. A H1 period is never treated as a FY comparison.

ADR-007: `scripts/refresh-market-snapshot.mjs` is an offline normalization boundary. It accepts a reviewed local JSON capture, validates it, renders deterministic TypeScript, and atomically replaces the target only after validation. It does not fetch, scrape, retry around rate limits, or depend on credentials. `src/data/manifest.ts` reports the current bundled snapshot lineage.

V0.3B cross-sector validation is deferred, not replaced with less traceable data.
