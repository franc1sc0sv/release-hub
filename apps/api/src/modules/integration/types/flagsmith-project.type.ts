import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagsmithProjectType {
  @Field(() => String)
  id: string

  @Field(() => String)
  name: string
}
