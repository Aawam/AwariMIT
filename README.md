# AwariMIT

Market Intelligence Tools for a disciplined Indonesia-market research workflow.

AwariMIT is a decision-support prototype for retail investors and swing-oriented researchers. V0.3 is complete: it established a stock-agnostic profile-driven architecture with BBCA as the initial BANKING validation subject. Cross-sector empirical validation remains unproven until a non-bank stock has both traceable issuer fundamentals and reproducible OHLCV history. It is not a broker, auto-trader, buy/sell signal, or return forecast.

## Current scope

- IHSG market context, with an explicitly dated bundled capture
- BBCA reference-stock research workspace
- 244 captured BBCA HLCV sessions through 18 September 2026; future refresh inputs require full OHLCV
- Deterministic returns, MA20/50/200, relative volume, ATR14, volatility, price range and risk measures
- Latest H1 2026 BCA issuer fundamentals, with FY2025 retained as a separate annual reference
- REPORTED versus DERIVED metric labels, reporting periods, publication dates, source quality and source URLs
- Safe local reviewed-capture ingestion via `npm run data:ingest` (`data:update` remains compatible)
- Optional multi-ticker daily OHLCV capture through the external MIT-licensed Hermes market skill, normalized into the same validated snapshot path
- Composite Score, Evidence Coverage, Confidence, missing-evidence disclosure and status gating

## Run locally

```text
npm install
npm run dev
```

Open http://localhost:5173.

```text
npm test
npm run lint
npm run build
npm run data:update
npm run data:ingest
npm run data:fetch:hermes -- --ticker TLKM --output /absolute/path/to/tlkmPriceBars.ts
```

## Data and limitations

BBCA market history is a bundled Yahoo Finance public chart capture, retrieved 2026-09-18T02:46:57Z. It is not live and Yahoo is not a production entitlement. `data:fetch:hermes` is an optional, separately installed Hermes-skill adapter for reproducible multi-ticker daily OHLCV snapshots; it requires local path configuration and preserves the same validation/provenance constraints. Latest fundamentals are from BCA's issuer-published H1 2026 report, while FY2025 remains a separate annual reference. No credentials, API keys, paid providers or untraceable AI-generated market claims are used. Cross-sector implementation remains conditional on acquiring traceable non-bank fundamentals and defining its BusinessProfile. See `docs/DATA.md`, `docs/MARKET_DATA_QUALIFICATION.md`, and `docs/MARKET_DATA_REUSE_DECISIONS.md`.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/METHODOLOGY.md`
- `docs/DATA.md`
- `docs/PRODUCT.md`
- `docs/ROADMAP.md`
- `docs/MARKET_DATA_QUALIFICATION.md`
- `docs/MARKET_DATA_REUSE_DECISIONS.md`
