import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class LinearConnectionStatus {
  @Field(() => Boolean)
  connected!: boolean

  @Field(() => String, { nullable: true })
  linearUser!: string | null
}
