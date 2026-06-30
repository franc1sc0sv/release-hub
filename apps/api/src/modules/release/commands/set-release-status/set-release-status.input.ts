import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'

@InputType()
export class SetReleaseStatusInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => ReleaseStatus)
  @IsEnum(ReleaseStatus)
  status: ReleaseStatus
}
