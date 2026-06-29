import { Field, ID, ObjectType } from '@nestjs/graphql'
import { ProjectRole } from '../../../common/types/project-role.enum'

@ObjectType()
export class MemberType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  userId: string

  @Field(() => ID)
  projectId: string

  @Field(() => ProjectRole)
  role: ProjectRole

  @Field(() => String)
  name: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  avatarUrl: string | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
