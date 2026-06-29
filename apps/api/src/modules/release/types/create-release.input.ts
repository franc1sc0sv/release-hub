import { Field, ID, InputType } from '@nestjs/graphql'
import { IsArray, IsNotEmpty, IsString, ArrayMaxSize, MaxLength } from 'class-validator'

@InputType()
export class CreateReleaseInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  projectId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  baseRef: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  compareRef: string

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[]
}
