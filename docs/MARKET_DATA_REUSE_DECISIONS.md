# Market-Data Reuse Decisions

Audit date: 2026-09-19. Upstream source was inspected at its then-current default-branch commit; no upstream code was copied into AwariMIT.

| Repository | Capability assessed | Classification | License | Access risk | Decision |
| --- | --- | --- | --- | --- | --- |
| `jagres0039/hermes-market-skills` | `skills/saham_idn/feeds.py`: IDX ticker normalization, yfinance daily OHLCV, retry/backoff; RSS feeds | WRAP AS PROVIDER | MIT | Yahoo is public-secondary and can rate-limit; RSS publisher terms still apply | Adopt the OHLCV feed through a thin process adapter. Do not adopt recommendation, entry, stop, target, verdict, Telegram, or sentiment-score logic. RSS is reusable later as contextual evidence only. |
| `NeaByteLab/IDX-API` | IDX routes, session initialization, browser headers, trading summary, announcements, reports, ratios | REFERENCE ONLY | MIT | Undocumented exchange web routes; all tested session-pattern requests returned HTTP 403 | Preserve endpoint knowledge for future authorized review. Do not port Deno, SQLite, Drizzle, sync architecture, or the browser-emulation transport. |
| `INo-xious/stockbit-mcp` | Read-only bars, financials, corporate actions, news, evidence ladder | REJECT | MIT | Private/undocumented Stockbit APIs require a rotating authenticated session; many routes are PROJECTED | Reuse its OBSERVED/PROJECTED distinction as AwariMIT's provider-evidence vocabulary. No connector is installed; no account, trading, PIN, portfolio, watchlist, e-IPO, or credential code is adopted. |
| `Open-Dev-Society/OpenStock` | Provider separation, search/detail/watchlist/news and TradingView patterns | REFERENCE ONLY | AGPL-3.0 | Finnhub key and TradingView emerging-market availability constraints | Learn only high-level UX/provider-separation patterns. Copy no AGPL implementation code. |

## Adopted component

`jagres0039/hermes-market-skills`, `skills/saham_idn/feeds.py` `normalize_ticker` and `ohlcv` are invoked as-is by `scripts/capture-hermes-ohlcv.mjs`. The adapter passes only `PriceBar` fields into the existing `updateFromSnapshot` and validation boundary in `scripts/refresh-market-snapshot.mjs`; it does not expose yfinance or skill response structures to the UI or analytics.

This avoids a local Yahoo client, ticker suffix mapper, yfinance integration, retry/backoff implementation, dataframe flattening, and OHLCV column normalization. AwariMIT owns only process invocation, source attribution, canonical snapshot metadata, and validation.

## Evidence as of this audit

| Provider/capability | Evidence | Basis |
| --- | --- | --- |
| Hermes skill → Yahoo daily OHLCV for BBCA, TLKM, ANTM | OBSERVED | Live invocation returned 479/480 daily full-OHLCV rows respectively on 2026-09-19. |
| Hermes skill → public RSS ticker news | OBSERVED | Live invocation returned a BBCA-matching IDNFinancials RSS item on 2026-09-19. Not integrated into the application yet. |
| IDX-API session/header pattern → IDX historical stock summary | UNAVAILABLE | A home request, session-init index request, and `GetTradingInfoSS?code=BBCA` request each returned HTTP 403 in this environment. |
| IDX-API financial reports, ratios, announcements | PROJECTED | Routes and response normalization exist upstream but were not live-observed here. |
| Stockbit read-only data | PROJECTED | Its evidence model is useful, but access is private/session-authenticated and no AwariMIT live verification was attempted. |
| OpenStock Finnhub/TradingView path for IDX | UNAVAILABLE | No entitled key or verified IDX coverage was established; AGPL implementation is not adoptable. |

## Runtime use

The Hermes adapter is optional and requires a separately installed `hermes-market-skills` checkout plus its Python dependencies. It reads no secrets. Set only local paths:

```text
export AWARIMIT_HERMES_MARKET_SKILLS_ROOT=/absolute/path/to/hermes-market-skills
export AWARIMIT_HERMES_MARKET_PYTHON=/absolute/path/to/python-with-yfinance
npm run data:fetch:hermes -- --ticker TLKM --output /absolute/path/to/tlkmPriceBars.ts
```

The result remains a dated, attributable snapshot. On provider, JSON, ticker, or bar validation failure, no target snapshot is replaced. Yahoo Finance remains PUBLIC_SECONDARY convenience data, not an IDX entitlement or a production-service guarantee.

## Remaining gaps

- An authorized, reliable fundamental acquisition path that maps official issuer/IDX disclosures into period-aware `FundamentalSnapshot` records.
- An application-level RSS adapter and news snapshot policy; reuse is available but not yet needed for the OHLCV unblock.
- A qualified production market-data entitlement if unattended refresh reliability, redistribution, or service guarantees are required.
