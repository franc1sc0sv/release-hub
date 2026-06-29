export interface IAiSuggestion {
  featureId: string
  confidence: number
  rationale: string
}

export interface IGenerateSummaryOptions {
  model: string | null
  tone: string | null
}
