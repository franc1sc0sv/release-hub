import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class GenerateSummaryInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  releaseId: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  model: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tone: string | null

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  featureIds: string[] | null
}
