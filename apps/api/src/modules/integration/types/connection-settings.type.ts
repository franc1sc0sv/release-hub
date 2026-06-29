import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ConnectionSettingsType {
  @Field(() => Boolean)
  githubConnected: boolean

  @Field(() => Boolean)
  linearConnected: boolean

  @Field(() => Boolean)
  flagsmithConnected: boolean

  @Field(() => String, { nullable: true })
  flagsmithUrl: string | null

  @Field(() => String, { nullable: true })
  flagsmithProjectId: string | null
}
