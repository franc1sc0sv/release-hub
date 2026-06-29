import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsEmail()
  email: string

  @Field(() => String)
  @MinLength(8)
  password: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(100)
  name: string
}
