import { Field, ID, ObjectType } from '@nestjs/graphql'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'

@ObjectType()
export class ReleaseFlagDecisionResultType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  releaseId: string

  @Field(() => ID)
  trackedFlagId: string

  @Field(() => ReleaseFlagDecisionType)
  decision: ReleaseFlagDecisionType

  @Field(() => ID, { nullable: true })
  decidedById: string | null

  @Field(() => Date, { nullable: true })
  decidedAt: Date | null
}
