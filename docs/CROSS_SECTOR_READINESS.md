# Cross-Sector Readiness — V0.3A.3

This is a data-path assessment, not an investment assessment. No candidate is implemented by this document.

## TLKM — Telecom

- Business drivers: telecom usage, subscriber/customer base, ARPU, capex, and cash-flow economics.
- Official fundamental source: Telkom Investor Relations [Reports](https://www.telkom.co.id/sites/investor-relations/en_US/page/reports-1027).
- Latest observed report: H1 2026 consolidated financial statements, six months ended 30 June 2026, unaudited; published through the Telkom reports page.
- OHLCV path tested: Yahoo Finance public chart endpoint for `TLKM.JK`.
- OHLCV result: HTTP 429 rate-limited in this environment. No reproducible capture was obtained for MA20/50/200, ATR, relative volume, or available-period range.
- Potential profile: TELECOM, with issuer-reported revenue, EBITDA/margin, capex, cash flow, subscriber/ARPU evidence where traceable.
- Readiness: NOT READY.

## ANTM — Mining / metals

- Business drivers: nickel and gold exposure, production, sales volume, realized pricing, cost, reserves/resources, and leverage/cash flow.
- Official fundamental path tested: Antam reports page at `https://www.antam.com/en/reports`.
- Fundamental result: HTTP 403 from this environment; no report was collected.
- OHLCV path tested: Yahoo Finance public chart endpoint for `ANTM.JK`.
- OHLCV result: HTTP 429 rate-limited in this environment.
- Potential profile: MINING / METALS.
- Readiness: NOT READY.

## ICBP — Consumer staples

- Business drivers: volume growth, pricing, margins, distribution, input-cost exposure, cash flow, and leverage.
- Official fundamental path tested: `https://www.icbp.com/investor-relations/financial-information`.
- Fundamental result: DNS resolution failed in this environment; no official report was collected.
- OHLCV path: not evaluated further because the official-fundamental path was unavailable.
- Potential profile: CONSUMER.
- Readiness: NOT READY.

## Conclusion

No V0.3B subject is proposed. TLKM has the clearest official-fundamental path, but it does not meet the reproducible OHLCV requirement. The observed rate limits, automated-access block, and DNS failure are provider/access evidence, not conditions to bypass. A candidate becomes READY only after official fundamentals and a reproducible, attributable OHLCV path are both available.
