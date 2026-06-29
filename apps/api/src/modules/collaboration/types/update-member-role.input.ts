import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'
import { ProjectRole } from '../../../common/types/project-role.enum'

@InputType()
export class UpdateMemberRoleInput {
  @Field(() => ID)
  @IsString()
  membershipId: string

  @Field(() => ProjectRole)
  @IsEnum(ProjectRole)
  role: ProjectRole
}
