import { Field, InputType } from '@nestjs/graphql'
import { IsEmail } from 'class-validator'

@InputType()
export class RequestLoginCodeInput {
  @Field(() => String)
  @IsEmail()
  email: string
}
