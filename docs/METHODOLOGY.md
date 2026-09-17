# Methodology

The score is candidate quality under a transparent model, not expected return. Starting weights: momentum 25%, technical 20%, fundamental 20%, liquidity 15%, valuation 10%, risk 10%.

Momentum uses observed 1-month and 3-month returns. Technical structure compares last close with MA20 and MA50. Liquidity uses average daily traded value. Risk uses drawdown in the supplied price path. Fundamental and valuation factors are excluded when unavailable; missing values are never zero-filled. Score weights are renormalized to evidence available for each stock.

The initial weights are a hypothesis and have not been historically validated. Future evaluation must use only data published at T0 and compare T+5/T+10/T+20 results with IHSG and equal-weight universe baselines.
