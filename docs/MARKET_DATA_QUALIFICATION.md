# IDX Market-Data Qualification

This assessment distinguishes research/development access from production-safe entitlement. It does not authorize scraping, bypasses, credentials, paid services, or redistribution beyond a provider's terms.

## Yahoo Finance chart endpoint

- Source type: public-secondary convenience endpoint.
- Access / authentication: unauthenticated when available.
- IDX ticker format tested: `BBCA.JK`, `TLKM.JK`, and `ANTM.JK`.
- OHLC / volume / history: BBCA yielded a one-year HLCV capture; the source response shape supplies OHLCV and volume when available.
- Rate limits: TLKM and ANTM requests returned HTTP 429 in this environment.
- Manual export: no authorized manual-export workflow was established separately from the same provider path.
- Attribution and terms: preserve provider, ticker, interval, retrieval time, and PUBLIC_SECONDARY status; it is not an IDX entitlement.
- Development suitability: CONDITIONAL for reviewed prototype captures that can be independently reproduced and attributed.
- Production suitability: NOT SUITABLE for unattended multi-ticker refresh.
- Qualification: CONDITIONAL.

## IDX public company pages

- Source type: official exchange web context.
- Access / authentication: public web route tested without credentials.
- IDX ticker support: exchange-listed company context in principle.
- OHLC / volume / history: no documented, usable automated OHLCV or manual-export route was established in this work.
- Latest access result: the BBCA company page returned HTTP 403 in this environment.
- Development and production suitability: NOT SUITABLE for this prototype's ingestion route until IDX provides an authorized export/API path.
- Qualification: NOT SUITABLE.

## Stooq CSV route

- Source type: public data endpoint.
- Access / authentication: unauthenticated route tested.
- IDX ticker format tested: `tlkm.id`.
- OHLC / volume / history: no usable CSV was returned.
- Latest access result: HTTP 200 returned an HTML JavaScript verification challenge rather than market data.
- Manual export: not established.
- Development and production suitability: NOT SUITABLE. The challenge will not be bypassed.
- Qualification: NOT SUITABLE.

## EOD Historical Data (EODHD)

- Source type: documented commercial market-data API.
- Access / authentication: API token required; the documented `demo` token returned HTTP 403 for `TLKM.JK` in this environment.
- IDX ticker / OHLC / volume / history: not verified without an entitled account and a provider-confirmed Indonesia instrument/exchange mapping.
- Cost, rate limits, attribution, redistribution: account-plan and provider terms must be reviewed before use.
- Manual export: not established in this assessment.
- Development suitability: CONDITIONAL after account access and explicit verification of IDX coverage, history depth, volume, and permitted local capture use.
- Production suitability: CONDITIONAL after entitlement and terms review; no account was purchased or created.
- Qualification: CONDITIONAL.

## Twelve Data

- Source type: documented commercial API with account-based access.
- Access / authentication: the `demo` key returned HTTP 401 and explicitly required a personal API key.
- IDX ticker / OHLC / volume / history: not verified from an entitled account; documentation reviewed in this assessment did not establish a usable Indonesia exchange path.
- Cost, rate limits, attribution, redistribution: plan and terms require review before any use.
- Manual export: not established.
- Development suitability: CONDITIONAL only after user-authorized account access and explicit IDX coverage verification.
- Production suitability: CONDITIONAL only after entitlement and terms review.
- Qualification: CONDITIONAL.

## Alpha Vantage

- Source type: documented account-based API.
- Access / authentication: the `demo` key returned an informational response requiring a personal API key.
- IDX ticker / OHLC / volume / history: no supported IDX mapping was established in this assessment.
- Cost, rate limits, attribution, redistribution: account plan and terms require review before use.
- Manual export: not established.
- Development suitability: NOT SUITABLE now because IDX coverage was not verified.
- Production suitability: NOT SUITABLE without verified IDX coverage and entitlement.
- Qualification: NOT SUITABLE.

## Issuer investor-relations reports

- Source type: official issuer disclosure.
- Access: company-specific public reports where accessible.
- OHLC / volume / history: not a market-history source.
- Development and production suitability: QUALIFIED for traceable issuer fundamentals, not for technical history.
- Qualification: QUALIFIED for fundamentals only.

## Selected strategy

AwariMIT remains capture-first and provider-independent:

```text
authorized/manual export or reviewed attributable capture
→ data:ingest validation
→ deterministic normalized snapshot
→ per-stock provenance
```

`MarketDataProvider`, `HistoryRequest`, `MarketHistoryResult`, and normalized full `PriceBar` remain the provider boundary. No `data:fetch` command exists: no tested provider is both accessible without unapproved credentials and qualified for reproducible multi-ticker IDX OHLCV acquisition.

## Current conclusion

A legitimate cross-sector data path is not yet established. The next acceptable path is either an authorized manual export with clear source terms and enough OHLCV history, or an explicitly user-approved provider account whose IDX coverage, history, volume, rate limits, local retention, and attribution terms are verified. Until then, cross-sector implementation remains blocked.