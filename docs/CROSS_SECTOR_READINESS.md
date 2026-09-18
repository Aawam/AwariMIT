# Cross-Sector Readiness

This is a data-path assessment, not an investment assessment. BBCA remains the initial BANKING validation subject, not the AwariMIT framework. No non-bank stock is implemented by this document.

## TLKM — Telecom

- Business drivers: telecom usage, subscriber/customer base, ARPU, capex, and cash-flow economics.
- Official fundamental source: Telkom Investor Relations [Reports](https://www.telkom.co.id/sites/investor-relations/en_US/page/reports-1027).
- Latest observed report: H1 2026 consolidated financial statements, six months ended 30 June 2026, unaudited; published through the Telkom reports page.
- OHLCV paths: Yahoo `TLKM.JK` returned HTTP 429; Stooq `tlkm.id` returned an HTML verification challenge; EODHD's demo route returned HTTP 403.
- History availability: no attributable, reproducible OHLCV capture was obtained for MA20/50/200, ATR, relative volume, and available-period range.
- Potential reusable profile: TELECOM, using issuer-reported revenue, EBITDA/margin, capex, cash flow, subscriber/ARPU evidence where traceable.
- Readiness: NOT READY.

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

No V0.4 cross-sector subject is proposed. TLKM remains the clearest profile test if a legitimate OHLCV source becomes available, but it does not meet the current reproducibility gate. The provider findings are recorded in `docs/MARKET_DATA_QUALIFICATION.md`. A candidate becomes READY only when official/strongly traceable fundamentals and attributable, reproducible OHLCV history are both available without bypassing controls or adding unapproved credentials.