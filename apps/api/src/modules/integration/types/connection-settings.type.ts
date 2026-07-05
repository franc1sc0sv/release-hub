import { Field, ObjectType } from '@nestjs/graphql'
import { GithubAuthMode } from '../../../common/types/github-auth-mode.enum'

@ObjectType()
export class ConnectionSettingsType {
  @Field(() => GithubAuthMode)
  githubAuthMode: GithubAuthMode

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

  @Field(() => Boolean)
  flagsmithWebhookSecretSet: boolean

  @Field(() => String)
  flagsmithWebhookPath: string

  @Field(() => Boolean)
  githubWebhookSecretSet: boolean

  @Field(() => String, { nullable: true })
  githubWebhookPath: string | null
}
