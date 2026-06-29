import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsString } from 'class-validator'
import { ProjectRole } from '../../../common/types/project-role.enum'

@InputType()
export class InviteMemberInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsEmail()
  email: string

  @Field(() => ProjectRole)
  @IsEnum(ProjectRole)
  role: ProjectRole
}
