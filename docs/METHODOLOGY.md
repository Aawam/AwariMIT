# Methodology

## Composite Score

AwariMIT Score is a 0–100 candidate-quality score, not a probability of positive return and not a trading recommendation. It normalizes the weighted values of available factors: Momentum 25%, Technical 20%, Fundamental 20%, Liquidity 15%, Valuation 10%, and Risk 10%.

## Evidence Coverage

Evidence Coverage is `available configured weight / total configured weight`. It is displayed independently of score because two equal normalized scores with different coverage are not equally supported. Missing values are excluded, never treated as zero.

## Confidence

Transparency thresholds are configured in `src/config/screening.ts`:

- HIGH: coverage at least 85%
- MEDIUM: coverage at least 65%
- LIMITED: coverage at least 45%
- INSUFFICIENT: coverage below 45%

They are hypotheses for presenting evidence quality, not investment truths.

## Status gating

Strong Candidate requires score ≥75 and HIGH confidence. A result with INSUFFICIENT confidence is always labelled Insufficient Evidence, even if a normalized score is high. High Risk is reserved for low risk-history scores. Other labels are Candidate, Watch, and Weak Setup.

## Validation limitation

No historical performance claim is made. A point-in-time evaluation is deferred because this bundled capture has only a short, non-versioned price window and incomplete fundamental publication dates. Building a valid no-look-ahead evaluation from it would create false confidence.

## Banking profile

BBCA uses the BANKING profile. Its compact fundamental evidence accepts issuer-reported ROE or bank-relevant net-profit growth; it does not require industrial metrics such as inventory turnover, gross margin, or EV/EBITDA. Missing required banking evidence still reduces coverage. FY valuation values remain an annual reference rather than being silently applied to H1 2026.

## Reported and derived values

Issuer statements are marked REPORTED. Deterministic calculations such as H1 net-profit growth are marked DERIVED and state their method. Derived values are not presented as issuer-reported facts. Publication date, rather than retrieval date, establishes the period-aware availability of issuer fundamentals.
