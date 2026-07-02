import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class SlackChannel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string
}
