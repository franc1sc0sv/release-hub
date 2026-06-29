import type { SummaryChunkType } from '../types/summary-chunk.type'

export interface IAiSuggestInput {
  prTitle: string
  prBranch: string
  prBody: string | null
  commitMessages: string[]
  changedPaths: string[]
  linkedTicketTitle: string | null
  features: Array<{
    id: string
    name: string
    description: string
    kind: string
    tags: string[]
  }>
}

export interface IAiSuggestResult {
  featureId: string
  confidence: number
  rationale: string
}

export interface IAiPrSummaryInput {
  prTitle: string
  prBody: string | null
  commitMessages: string[]
  tickets: Array<{ title: string; description: string | null }>
}

export interface IAiPrSummaryResult {
  summary: string
}

export interface IAiStreamSummaryInput {
  releaseTitle: string
  tone: string | null
  model: string | null
  features: Array<{
    featureId: string
    name: string
    description: string
    statusLine: string
    prSummaries: string[]
  }>
}

export abstract class IAiProvider {
  abstract suggest(input: IAiSuggestInput): Promise<IAiSuggestResult>
  abstract summarizePullRequest(input: IAiPrSummaryInput): Promise<IAiPrSummaryResult>
  abstract streamSummary(input: IAiStreamSummaryInput): AsyncIterable<SummaryChunkType>
}
