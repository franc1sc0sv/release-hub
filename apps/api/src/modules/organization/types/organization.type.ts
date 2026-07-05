import { Field, ID, ObjectType } from '@nestjs/graphql'
import { OrgRole } from '../../../common/types/org-role.enum'

@ObjectType()
export class OrganizationType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  slug: string | null

  @Field(() => OrgRole)
  role: OrgRole

  @Field(() => Boolean)
  githubConnected: boolean
}
