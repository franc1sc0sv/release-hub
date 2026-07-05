import { Field, ID, ObjectType } from '@nestjs/graphql'
import { OrgRole } from '../../../common/types/org-role.enum'

@ObjectType()
export class OrganizationMemberType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  userId: string

  @Field(() => ID)
  organizationId: string

  @Field(() => OrgRole)
  role: OrgRole

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
