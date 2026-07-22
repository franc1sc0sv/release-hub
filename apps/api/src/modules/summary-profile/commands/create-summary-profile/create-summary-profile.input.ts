import { Field, ID, InputType } from '@nestjs/graphql'
import { IsArray, IsOptional, IsString, MaxLength, ArrayMaxSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { SummaryProfileRuleInput } from '../../types/summary-profile-rule.input'
import { SummaryProfileExampleInput } from '../../types/summary-profile-example.input'

@InputType()
export class CreateSummaryProfileInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  @MaxLength(80)
  name: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  outputTemplate?: string

  @Field(() => [SummaryProfileRuleInput])
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SummaryProfileRuleInput)
  rules: SummaryProfileRuleInput[]

  @Field(() => [SummaryProfileExampleInput])
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SummaryProfileExampleInput)
  examples: SummaryProfileExampleInput[]
}
