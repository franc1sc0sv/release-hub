import type { SummaryExampleKind } from '../../../common/types/summary-example-kind.enum'

export interface ISummaryProfileRule {
  id: string
  content: string
  position: number
}

export interface ISummaryProfileExample {
  id: string
  kind: SummaryExampleKind
  content: string
  explanation: string
  position: number
}

export interface ISummaryProfile {
  id: string
  projectId: string
  name: string
  description: string | null
  outputTemplate: string | null
  createdAt: Date
  updatedAt: Date
  rules: ISummaryProfileRule[]
  examples: ISummaryProfileExample[]
}

export interface ICreateSummaryProfileRuleData {
  content: string
}

export interface ICreateSummaryProfileExampleData {
  kind: SummaryExampleKind
  content: string
  explanation: string
}

export interface ICreateSummaryProfileData {
  projectId: string
  name: string
  description: string | null
  outputTemplate: string | null
  rules: ICreateSummaryProfileRuleData[]
  examples: ICreateSummaryProfileExampleData[]
}

export interface IUpdateSummaryProfileData {
  name: string
  description: string | null
  outputTemplate: string | null
  rules: ICreateSummaryProfileRuleData[]
  examples: ICreateSummaryProfileExampleData[]
}
