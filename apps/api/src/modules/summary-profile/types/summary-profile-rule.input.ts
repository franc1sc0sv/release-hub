import { Field, InputType } from '@nestjs/graphql'
import { IsString, MaxLength } from 'class-validator'

@InputType()
export class SummaryProfileRuleInput {
  @Field(() => String)
  @IsString()
  @MaxLength(500)
  content: string
}
