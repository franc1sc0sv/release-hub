import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class GithubConnectionStatus {
  @Field(() => Boolean)
  connected!: boolean

  @Field(() => String, { nullable: true })
  githubLogin!: string | null
}
