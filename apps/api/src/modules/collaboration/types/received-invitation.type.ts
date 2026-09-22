import { Field, ID, ObjectType } from '@nestjs/graphql'
import { OrgRole } from '../../../common/types/org-role.enum'

@ObjectType()
export class ReceivedInvitationType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  token: string

  @Field(() => ID)
  organizationId: string

  @Field(() => String)
  organizationName: string

  @Field(() => String)
  inviterName: string

  @Field(() => OrgRole)
  role: OrgRole

  @Field(() => Date)
  expiresAt: Date

  @Field(() => Date)
  createdAt: Date
}
