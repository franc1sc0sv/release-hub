import { Field, ID, ObjectType } from '@nestjs/graphql'
import { UserRole, UserRoleGql } from '../../../common/types/user-role.enum'

@ObjectType()
export class UserProfileType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  email: string

  @Field(() => String)
  name: string

  @Field(() => UserRoleGql)
  role: UserRole

  @Field(() => String, { nullable: true })
  avatarUrl: string | null
}
