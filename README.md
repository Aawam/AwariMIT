# AwariMIT

Market Intelligence Tools for a disciplined Indonesia-market research workflow.

AwariMIT is a decision-support prototype for retail investors and swing-oriented researchers. It turns a small IDX seed universe into a transparent market overview, ranked candidates and an evidence-led stock detail page. It is not a broker, auto-trader, buy/sell signal, or return forecast.

## Current scope

- IHSG market pulse and a transparent short-term regime label
- Five liquid IDX seed names: BBCA, BMRI, TLKM, ASII and ANTM
- Deterministic Composite Score plus separate Evidence Coverage and Confidence classifications
- Search, minimum-score, evidence-coverage and confidence filtering
- Stock-level Fundamental, Technical and News intelligence sections, missing-evidence disclosure, and provenance
- Responsive single-page UI

## Run locally

Requires Node 20.19+ (the project was built with Vite 6; the current host's 20.15 also built successfully).

```text
npm install
npm run dev
```

Open http://localhost:5173.

```text
npm run test
npm run lint
npm run build
```

## Architecture

`src/domain` has typed data contracts; `src/data` provides the bundled provider capture; `src/analytics` contains testable deterministic calculations and ranking; `src/config` centralizes score weights; and the React UI displays results without calculating them.

## Data sources and limitations

V0 bundles a 16 September 2026 price capture from Yahoo Finance's unofficial chart endpoint, with a source and timestamp on the price data. Yahoo is a convenience source, not a production data entitlement. IDX returned HTTP 403 in this environment and Yahoo financial-summary access returned HTTP 401. Therefore, coverage is intentionally small and most fundamentals display as unavailable rather than being guessed. See `docs/DATA.md`.

## Methodology

The Composite Score is explainable candidate quality, not a recommendation. Initial weights are Momentum 25%, Technical 20%, Fundamental 20%, Liquidity 15%, Valuation 10%, Risk 10%. Missing inputs are excluded and weights are normalized over available evidence, while Evidence Coverage separately shows how much configured evidence is present. Confidence is derived from configured coverage thresholds. See `docs/METHODOLOGY.md`.

## Documentation

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/METHODOLOGY.md`
- `docs/DATA.md`
- `docs/ROADMAP.md`

## Roadmap

The next bounded steps are an authorized data-provider adapter, a configurable IDX30/LQ45 universe, and point-in-time historical evaluation. No automatic trade execution is planned.