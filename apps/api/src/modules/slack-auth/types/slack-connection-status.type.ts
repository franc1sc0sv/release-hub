import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class SlackConnectionStatus {
  @Field(() => Boolean)
  connected!: boolean

  @Field(() => String, { nullable: true })
  teamName!: string | null

  @Field(() => String, { nullable: true })
  channelId!: string | null

  @Field(() => String, { nullable: true })
  channelName!: string | null

  @Field(() => Boolean)
  notifyOnCreated!: boolean

  @Field(() => Boolean)
  notifyOnShipped!: boolean

  @Field(() => Boolean)
  notifyOnDeployed!: boolean
}
