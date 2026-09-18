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

Strong Candidate requires score ≥75 and HIGH confidence. A result with INSUFFICIENT confidence is always labelled Insufficient Evidence, even if a normalized score is high. Candidate Status is limited to Strong Candidate, Candidate, Watch, Weak Setup, and Insufficient Evidence.

## Risk semantics

Risk Score is separate from Candidate Status: 0 is the lowest measured risk and 100 is the highest measured risk. The deterministic assessment has three transparent contribution caps configured in `src/config/screening.ts`: captured-period drawdown up to 70 points, momentum/trend weakness up to 20 points, and 20-day volatility up to 10 points. Momentum and trend are overlapping price-weakness measures, so only their larger normalized value contributes; they are not added together.

Drawdown reaches its full 70-point contribution at a 50% captured-period drawdown. Volatility begins contributing above 1% and reaches its full contribution at 5%. Thresholds classify 0–33 as Low, 34–66 as Moderate, and 67–100 as High. The Composite Score uses the inverse, Risk Quality, for its configured 10% factor. Risk Level does not gate Candidate Status, so risk is not silently double-counted. Missing evidence changes Coverage and Confidence, not Risk Score. This is a measurement of the bundled capture, not a prediction or a trading instruction.

## Validation limitation

No historical performance claim is made. A point-in-time evaluation is deferred because this bundled capture has only a short, non-versioned price window and incomplete fundamental publication dates. Building a valid no-look-ahead evaluation from it would create false confidence.

## Banking profile

The BANKING profile applies to any supported bank. Its compact fundamental evidence accepts issuer-reported ROE or bank-relevant net-profit growth; it does not require industrial metrics such as inventory turnover, gross margin, or EV/EBITDA. Missing required banking evidence still reduces coverage. FY valuation values remain an annual reference rather than being silently applied to an interim period.

Fundamental evidence is profile-specific, while technical analysis, risk, liquidity, valuation, evidence coverage, confidence, candidate status, events, and provenance are shared. BBCA is the current BANKING validation subject, not a special-case evaluation rule.

## Reported and derived values

Issuer statements are marked REPORTED. Deterministic calculations such as H1 net-profit growth are marked DERIVED and state their method. Derived values are not presented as issuer-reported facts. Publication date, rather than retrieval date, establishes the period-aware availability of issuer fundamentals.
