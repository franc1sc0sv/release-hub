import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class ClearReleaseFlagDecisionInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => ID)
  @IsString()
  trackedFlagId: string
}
