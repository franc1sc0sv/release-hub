import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class GithubInstallResultType {
  @Field(() => ID)
  organizationId: string

  @Field(() => Boolean)
  connected: boolean
}
