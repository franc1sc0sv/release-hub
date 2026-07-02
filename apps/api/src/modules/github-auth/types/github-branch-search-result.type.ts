import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class GithubBranchSearchItemType {
  @Field(() => String)
  name!: string

  @Field(() => Boolean)
  protected!: boolean
}

@ObjectType()
export class GithubBranchSearchResultType {
  @Field(() => [GithubBranchSearchItemType])
  items!: GithubBranchSearchItemType[]

  @Field(() => Boolean)
  hasMore!: boolean
}
