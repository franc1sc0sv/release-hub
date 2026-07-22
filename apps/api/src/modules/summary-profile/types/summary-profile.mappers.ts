import type { ISummaryProfile, ISummaryProfileRule, ISummaryProfileExample } from '../interfaces/summary-profile.interfaces'
import { SummaryProfileType } from './summary-profile.type'
import { SummaryProfileRuleType } from './summary-profile-rule.type'
import { SummaryProfileExampleType } from './summary-profile-example.type'

function toSummaryProfileRuleType(rule: ISummaryProfileRule): SummaryProfileRuleType {
  const type = new SummaryProfileRuleType()
  type.id = rule.id
  type.content = rule.content
  return type
}

function toSummaryProfileExampleType(example: ISummaryProfileExample): SummaryProfileExampleType {
  const type = new SummaryProfileExampleType()
  type.id = example.id
  type.kind = example.kind
  type.content = example.content
  type.explanation = example.explanation
  return type
}

export function toSummaryProfileType(profile: ISummaryProfile): SummaryProfileType {
  const type = new SummaryProfileType()
  type.id = profile.id
  type.projectId = profile.projectId
  type.name = profile.name
  type.description = profile.description
  type.outputTemplate = profile.outputTemplate
  type.createdAt = profile.createdAt
  type.updatedAt = profile.updatedAt
  type.rules = profile.rules.map(toSummaryProfileRuleType)
  type.examples = profile.examples.map(toSummaryProfileExampleType)
  return type
}
