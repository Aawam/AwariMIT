# IDX Market-Data Qualification — V0.4

This assessment distinguishes source availability from a production-safe entitlement. It does not authorize scraping, bypasses, credentials, or paid services.

## Yahoo Finance chart endpoint

- Access: public, unauthenticated convenience endpoint.
- IDX support: BBCA was captured successfully in V0.2; TLKM and ANTM later returned HTTP 429 in this environment.
- OHLCV and volume: available when a response is returned.
- History depth: sufficient for the existing BBCA one-year prototype capture.
- Cost/authentication: no observed cost or authentication for the tested public route.
- Limits and terms: rate limiting makes multi-ticker reproduction unreliable; it is not an IDX entitlement or production-safe provider.
- Attribution: every capture must retain the provider, ticker, retrieval time, interval, and source-quality label.
- Qualification: CONDITIONAL for reviewed prototype captures only; NOT QUALIFIED for automated multi-ticker refresh.

## IDX public company pages

- Access: public web route tested without credentials.
- IDX support: authoritative issuer/exchange context in principle.
- OHLCV and volume: no documented, usable automated OHLCV route was established.
- Latest test: the BBCA company page returned HTTP 403 in this environment.
- Qualification: NOT SUITABLE for this prototype's automated ingestion path.

## Stooq CSV route

- Access: public route tested without credentials.
- IDX support: TLKM route was tested.
- OHLCV and volume: no usable payload was returned.
- Latest test: HTTP 200 returned an HTML JavaScript verification challenge rather than CSV market history.
- Qualification: NOT SUITABLE. The challenge will not be bypassed.

## Issuer investor-relations reports

- Access: company-specific public reports where accessible.
- IDX support: official issuer fundamentals; Telkom's reports page was accessible during V0.3 research.
- OHLCV and volume: not a market-history source.
- Qualification: QUALIFIED for traceable issuer fundamentals, not for technical history.

## Selected V0.4 data path

AwariMIT remains capture-first and provider-independent:

```text
reviewed local OHLCV capture
→ structural validation
→ deterministic TypeScript snapshot
→ per-stock provenance
```

`MarketDataProvider` and normalized `PriceBar` / `MarketHistoryResult` contracts establish the future provider boundary. No provider fetch is implemented because no tested automated IDX OHLCV route meets the multi-ticker reproducibility gate. `npm run data:ingest` is an alias for reviewed local ingestion; it does not fetch a provider.

## Conclusion

No production-safe multi-ticker IDX OHLCV provider is qualified. Cross-sector implementation remains blocked until an authorized or demonstrably reproducible source is available. This is a data-quality gate, not a reason to weaken provenance or fabricate a second-stock capture.
