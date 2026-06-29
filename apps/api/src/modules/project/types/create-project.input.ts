import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  repo: string
}
