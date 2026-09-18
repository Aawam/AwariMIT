export const screeningWeights = {
  momentum: 25,
  technical: 20,
  fundamental: 20,
  liquidity: 15,
  valuation: 10,
  risk: 10,
} as const

export const confidenceThresholds = {
  high: 85,
  medium: 65,
  limited: 45,
} as const

export const scoringNotes = 'Composite Score is normalized across available factors, while Evidence Coverage separately reports the configured weight represented by observed evidence. Missing data is excluded, never treated as zero. Score is candidate quality, not a return forecast or trading recommendation.'
