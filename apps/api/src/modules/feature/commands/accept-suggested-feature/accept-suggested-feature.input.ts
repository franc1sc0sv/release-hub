import { Field, ID, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class AcceptSuggestedFeatureInput {
  @Field(() => ID)
  @IsString()
  featureId: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string | null

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  tags: string[] | null
}
