import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

@InputType()
export class UpdateOrganizationInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  organizationId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string
}
