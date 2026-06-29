import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagStateType {
  @Field(() => Boolean)
  staging: boolean

  @Field(() => Boolean)
  production: boolean
}
