import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class SlackTestMessageResult {
  @Field(() => Boolean)
  ok!: boolean

  @Field(() => String, { nullable: true })
  error!: string | null
}
