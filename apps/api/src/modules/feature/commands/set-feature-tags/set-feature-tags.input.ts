import { Field, ID, InputType } from '@nestjs/graphql'
import { IsArray, IsString, ArrayMaxSize, MaxLength } from 'class-validator'

@InputType()
export class SetFeatureTagsInput {
  @Field(() => ID)
  @IsString()
  featureId: string

  @Field(() => [String])
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags: string[]
}
