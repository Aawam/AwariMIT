# Architecture

React + TypeScript + Vite serves a static client application. `src/data` contains period-aware issuer snapshots and validated market captures; `src/analytics` is UI-independent deterministic calculation; `src/config` contains scoring weights and confidence thresholds; `src/domain` contains the data contract; and `src/App.tsx` presents results.

ADR-001: Use bundled captures for V0. The provider boundary keeps a licensed server-side provider replaceable. No credentials are embedded.

ADR-002: No database, backend, AI, queues or chart dependency. An SVG price path is sufficient for the first vertical slice.

ADR-003: Keep Composite Score, Evidence Coverage and Confidence separate. Score can normalize missing factors, but coverage preserves how much configured evidence is actually represented. Status gating prevents a sparse high score from becoming Strong Candidate.

ADR-004: Use a `NewsProvider` boundary. BBCA has issuer-published filing facts; no untraceable fixture or AI narrative is presented as news.

ADR-005: BBCA is the reference stock. `src/data/bbcaPriceBars.ts` contains raw captured OHLCV history; `marketData.ts` derives moving averages, returns, relative volume, ATR and volatility deterministically.

ADR-006: `src/data/fundamentals.ts` keeps an H1 2026 snapshot and a separate FY2025 annual reference. Every snapshot has reporting period, period type, publication date, retrieval time, source quality, consolidation basis, source URL and REPORTED/DERIVED metric status. A H1 period is never treated as a FY comparison.

ADR-007: `scripts/refresh-market-snapshot.mjs` is an offline normalization boundary. It accepts a reviewed local JSON capture for any uppercase IDX-style ticker, validates it, renders deterministic TypeScript, and atomically replaces only the requested target after validation. It does not fetch, scrape, retry around rate limits, or depend on credentials. `src/data/manifest.ts` reports the current bundled snapshot lineage.

ADR-008: Evaluation is stock-agnostic. A `Stock` carries a `BusinessProfile`, period-aware fundamental snapshots, and optional technical reference data. `src/config/businessProfiles.ts` defines the applicable fundamental evidence and presentation metrics for BANKING; the screener, risk engine, confidence framework, event model, and candidate status operate on `Stock`, not a ticker. BBCA is the first data subject for BANKING, not a special evaluation branch.

ADR-009: `MarketDataProvider`, `HistoryRequest`, `MarketHistoryResult`, and normalized full `PriceBar` types define the provider boundary. Provider response handling must normalize before data reaches analytics, risk, screening, or UI. `scripts/capture-hermes-ohlcv.mjs` is an optional process adapter for the MIT-licensed `hermes-market-skills` `saham_idn` OHLCV feed. It produces a dated canonical snapshot and then calls the existing validation/write boundary; it never sends an internet response to the UI. Reviewed portable ingestion remains available as the provider-independent fallback. Provider evidence is recorded as OBSERVED, PROJECTED, or UNAVAILABLE in `docs/MARKET_DATA_REUSE_DECISIONS.md`.

V0.3 is complete. It established the profile-driven pipeline, period-aware fundamentals, calibrated shared risk semantics, provenance/freshness separation, and safe ingestion with BBCA as the initial BANKING subject. Cross-sector empirical validation is carried forward and must not be claimed until a non-bank subject has both traceable issuer fundamentals and reproducible OHLCV history.
