import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class GithubBranchType {
  @Field(() => String)
  name!: string

  @Field(() => Boolean)
  protected!: boolean

  @Field(() => String)
  commitSha!: string
}
