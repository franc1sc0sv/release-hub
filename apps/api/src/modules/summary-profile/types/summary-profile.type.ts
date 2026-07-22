import { Field, ID, ObjectType } from '@nestjs/graphql'
import { SummaryProfileRuleType } from './summary-profile-rule.type'
import { SummaryProfileExampleType } from './summary-profile-example.type'

@ObjectType()
export class SummaryProfileType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  projectId: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string | null

  @Field(() => String, { nullable: true })
  outputTemplate: string | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => [SummaryProfileRuleType])
  rules: SummaryProfileRuleType[]

  @Field(() => [SummaryProfileExampleType])
  examples: SummaryProfileExampleType[]
}
