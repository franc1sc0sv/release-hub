import { Field, ID, InputType } from '@nestjs/graphql'
import { IsArray, IsNotEmpty, IsString, MaxLength, ArrayMaxSize } from 'class-validator'

@InputType()
export class CreateFeatureInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  projectId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[]
}
