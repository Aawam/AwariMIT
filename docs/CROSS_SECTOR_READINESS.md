# Cross-Sector Readiness

This is a data-path assessment, not an investment assessment. BBCA remains the initial BANKING validation subject, not the AwariMIT framework. No non-bank stock is implemented by this document.

## TLKM — Telecom

- Business drivers: telecom usage, subscriber/customer base, ARPU, capex, and cash-flow economics.
- Official fundamental source: Telkom Investor Relations [Reports](https://www.telkom.co.id/sites/investor-relations/en_US/page/reports-1027).
- Latest observed report: H1 2026 consolidated financial statements, six months ended 30 June 2026, unaudited; issue date 31 July 2026. The official issuer PDF was fetched and deterministically parsed into `src/data/tlkmFundamentalSnapshot.ts` without OCR.
- OHLCV path: the reusable Hermes `saham_idn` adapter returned 480 full daily OHLCV bars for `TLKM.JK` and writes through AwariMIT's existing validated snapshot path.
- History availability: reproducible daily OHLCV is now established. The captured official metrics include total assets, total equity, revenue, operating profit, profit for the period, basic EPS, and operating cash flow.
- Potential reusable profile: TELECOM, using issuer-reported revenue, EBITDA/margin, capex, cash flow, subscriber/ARPU evidence where traceable.
- Readiness: READY FOR CROSS-SECTOR IMPLEMENTATION. The remaining work is a separately reviewed TELECOM BusinessProfile and integration; neither is implemented here.

## ANTM — Mining / metals

- Business drivers: nickel and gold exposure, production, sales volume, realized pricing, cost, reserves/resources, and leverage/cash flow.
- Official fundamental path: Antam reports page at `https://www.antam.com/en/reports` returned HTTP 403 in this environment.
- Latest reporting period: not collected because the official-report path was inaccessible.
- OHLCV path: Yahoo `ANTM.JK` returned HTTP 429; no alternative attributable history was established.
- Potential reusable profile: MINING / METALS.
- Readiness: NOT READY.

## ICBP — Consumer staples

- Business drivers: volume growth, pricing, margins, distribution, input-cost exposure, cash flow, and leverage.
- Official fundamental path: `https://www.icbp.com/investor-relations/financial-information` could not be resolved in this environment.
- Latest reporting period: not collected because the official-fundamental path was unavailable.
- OHLCV path: not evaluated further because a traceable fundamental source is a prerequisite.
- Potential reusable profile: CONSUMER.
- Readiness: NOT READY.

## Conclusion

TLKM is the first cross-sector implementation subject with both official/strongly traceable fundamentals and attributable, reproducible OHLCV history, without bypassing controls or adding credentials. This document does not create a TELECOM profile or claim an investment conclusion. Provider findings are recorded in `docs/MARKET_DATA_QUALIFICATION.md` and `docs/MARKET_DATA_REUSE_DECISIONS.md`.