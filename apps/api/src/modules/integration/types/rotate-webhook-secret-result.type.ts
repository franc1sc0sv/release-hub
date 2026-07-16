import { Field, ObjectType } from '@nestjs/graphql'
import { ConnectionSettingsType } from './connection-settings.type'

@ObjectType()
export class RotateWebhookSecretResultType {
  @Field(() => ConnectionSettingsType)
  connectionSettings: ConnectionSettingsType

  @Field(() => String)
  secret: string
}
