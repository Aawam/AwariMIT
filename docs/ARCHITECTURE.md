# Architecture

React + TypeScript + Vite serves a static client application. `src/data` contains provider-shaped captures; `src/analytics` is UI-independent deterministic calculation; `src/config` contains scoring weights and confidence thresholds; `src/domain` contains the data contract; and `src/App.tsx` presents results.

ADR-001: Use bundled captures for V0. The provider boundary keeps a licensed server-side provider replaceable. No credentials are embedded.

ADR-002: No database, backend, AI, queues or chart dependency. An SVG price path is sufficient for the first vertical slice.

ADR-003: Keep Composite Score, Evidence Coverage and Confidence separate. Score can normalize missing factors, but coverage preserves how much configured evidence is actually represented. Status gating prevents a sparse high score from becoming Strong Candidate.

ADR-004: Use a `NewsProvider` boundary. BBCA has issuer-published filing facts; no untraceable fixture or AI narrative is presented as news.

ADR-005: V0.2 makes BBCA the sole reference stock. `src/data/bbcaPriceBars.ts` contains the raw captured OHLCV history; `marketData.ts` derives moving averages, returns, relative volume, ATR and volatility deterministically. `bbcaFundamentalReference` uses BCA Annual Report 2025 values with source, period and retrieval metadata.
