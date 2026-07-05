import { Field, ID, ObjectType } from '@nestjs/graphql'
import { OrgRole } from '../../../common/types/org-role.enum'
import { InvitationStatus } from '../../../common/types/invitation-status.enum'

@ObjectType()
export class InvitationType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  email: string

  @Field(() => ID)
  organizationId: string

  @Field(() => OrgRole)
  role: OrgRole

  @Field(() => InvitationStatus)
  status: InvitationStatus

  @Field(() => Date)
  expiresAt: Date

  @Field(() => ID)
  invitedById: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
