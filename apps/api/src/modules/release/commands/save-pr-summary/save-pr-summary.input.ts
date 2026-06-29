import { Field, InputType } from '@nestjs/graphql'
import { IsString, MinLength } from 'class-validator'

@InputType()
export class SavePrSummaryInput {
  @Field(() => String)
  @IsString()
  prId: string

  @Field(() => String)
  @IsString()
  @MinLength(1)
  summary: string
}
