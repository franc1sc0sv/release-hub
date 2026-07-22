import { Field, ID, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, MinLength } from 'class-validator'

@InputType()
export class SaveReleaseSummaryInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => String)
  @IsString()
  @MinLength(1)
  summary: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  summaryProfileId: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  summaryModel: string | null
}
