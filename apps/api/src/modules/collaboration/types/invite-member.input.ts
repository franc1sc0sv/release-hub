import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsString } from 'class-validator'
import { OrgRole } from '../../../common/types/org-role.enum'

@InputType()
export class InviteMemberInput {
  @Field(() => ID)
  @IsString()
  organizationId: string

  @Field(() => String)
  @IsEmail()
  email: string

  @Field(() => OrgRole)
  @IsEnum(OrgRole)
  role: OrgRole
}
