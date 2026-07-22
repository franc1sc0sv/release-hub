import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class DeleteSummaryProfileInput {
  @Field(() => ID)
  @IsString()
  profileId: string
}
