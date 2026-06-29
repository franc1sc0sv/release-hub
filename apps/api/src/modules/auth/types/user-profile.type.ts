import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserProfileType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  email: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  avatarUrl: string | null
}
