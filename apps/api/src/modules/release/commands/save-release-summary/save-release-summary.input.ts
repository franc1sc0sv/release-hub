import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString, MinLength } from 'class-validator'

@InputType()
export class SaveReleaseSummaryInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => String)
  @IsString()
  @MinLength(1)
  summary: string
}
