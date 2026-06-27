import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AuthTokensType {
  @Field(() => String)
  accessToken: string

  @Field(() => String)
  refreshToken: string
}
