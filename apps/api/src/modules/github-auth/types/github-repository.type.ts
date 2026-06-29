import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class GithubRepositoryType {
  @Field(() => String)
  fullName!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  owner!: string

  @Field(() => Boolean)
  private!: boolean

  @Field(() => String)
  defaultBranch!: string

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => String)
  htmlUrl!: string
}
