import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsString()
  id: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  repo?: string
}
