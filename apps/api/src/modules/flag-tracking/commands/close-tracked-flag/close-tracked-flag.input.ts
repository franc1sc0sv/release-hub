import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString, MinLength } from 'class-validator'
import { FlagClosedReason } from '../../../../common/types/flag-closed-reason.enum'

@InputType()
export class CloseTrackedFlagInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  @MinLength(1)
  key: string

  @Field(() => FlagClosedReason)
  @IsEnum(FlagClosedReason)
  reason: FlagClosedReason
}
