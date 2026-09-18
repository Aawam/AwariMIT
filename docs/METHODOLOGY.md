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
