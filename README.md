# AwariMIT

Market Intelligence Tools for a disciplined Indonesia-market research workflow.

AwariMIT is a decision-support prototype for retail investors and swing-oriented researchers. V0.2 deliberately treats BBCA as a single reference stock before expanding market coverage. It is not a broker, auto-trader, buy/sell signal, or return forecast.

## Current scope

- IHSG market context, with an explicitly dated bundled capture
- BBCA reference-stock research workspace
- 244 captured BBCA OHLCV sessions through 18 September 2026
- Deterministic returns, MA20/50/200, relative volume, ATR14, volatility, price range and risk measures
- Traceable FY2025 BCA Annual Report fundamentals and official filing facts
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
```

## Data and limitations

BBCA market history is a bundled Yahoo Finance public chart capture, retrieved 2026-09-18T02:46:57Z. It is not live and Yahoo is not a production entitlement. Fundamentals and filing facts come from BCA's issuer-published Annual Report 2025. No credentials, API keys, paid providers or untraceable AI-generated market claims are used. See `docs/DATA.md`.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/METHODOLOGY.md`
- `docs/DATA.md`
- `docs/PRODUCT.md`
- `docs/ROADMAP.md`
