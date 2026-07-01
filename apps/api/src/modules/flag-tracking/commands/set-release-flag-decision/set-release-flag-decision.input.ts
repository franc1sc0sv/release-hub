import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'
import { ReleaseFlagDecisionType } from '../../../../common/types/release-flag-decision-type.enum'

@InputType()
export class SetReleaseFlagDecisionInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => ID)
  @IsString()
  trackedFlagId: string

  @Field(() => ReleaseFlagDecisionType)
  @IsEnum(ReleaseFlagDecisionType)
  decision: ReleaseFlagDecisionType
}
