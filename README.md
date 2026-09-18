# AwariMIT

Market Intelligence Tools for a disciplined Indonesia-market research workflow.

AwariMIT is a decision-support prototype for retail investors and swing-oriented researchers. V0.3A treats BBCA as a single reference stock with period-aware issuer fundamentals and validated static snapshots. It is not a broker, auto-trader, buy/sell signal, or return forecast.

## Current scope

- IHSG market context, with an explicitly dated bundled capture
- BBCA reference-stock research workspace
- 244 captured BBCA HLCV sessions through 18 September 2026; future refresh inputs require full OHLCV
- Deterministic returns, MA20/50/200, relative volume, ATR14, volatility, price range and risk measures
- Latest H1 2026 BCA issuer fundamentals, with FY2025 retained as a separate annual reference
- REPORTED versus DERIVED metric labels, reporting periods, publication dates, source quality and source URLs
- Safe local market-snapshot normalization via `npm run data:update`
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
```

## Data and limitations

BBCA market history is a bundled Yahoo Finance public chart capture, retrieved 2026-09-18T02:46:57Z. It is not live and Yahoo is not a production entitlement. Latest fundamentals are from BCA's issuer-published H1 2026 report, while FY2025 remains a separate annual reference. No credentials, API keys, paid providers or untraceable AI-generated market claims are used. Cross-sector validation is deferred because TLKM OHLCV data was not sufficiently traceable/reproducible. See `docs/DATA.md`.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/METHODOLOGY.md`
- `docs/DATA.md`
- `docs/PRODUCT.md`
- `docs/ROADMAP.md`
