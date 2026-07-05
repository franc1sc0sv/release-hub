import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'
import { OrgRole } from '../../../common/types/org-role.enum'

@InputType()
export class UpdateMemberRoleInput {
  @Field(() => ID)
  @IsString()
  membershipId: string

  @Field(() => OrgRole)
  @IsEnum(OrgRole)
  role: OrgRole
}
