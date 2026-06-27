import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, Length, Matches } from 'class-validator'

@InputType()
export class LoginWithCodeInput {
  @Field(() => String)
  @IsEmail()
  email: string

  @Field(() => String)
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string
}
