import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

@InputType()
export class CreateOrganizationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string
}
