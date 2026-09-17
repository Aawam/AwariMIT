export const screeningWeights = {
  momentum: 25,
  technical: 20,
  fundamental: 20,
  liquidity: 15,
  valuation: 10,
  risk: 10,
} as const

export const scoringNotes = 'Scores are normalized across available factors. Missing data is excluded, never treated as zero. This is a candidate-quality screen, not a return forecast or trading recommendation.'
