import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CommitType {
  @Field(() => String)
  sha: string

  @Field(() => String)
  message: string

  @Field(() => String)
  author: string

  @Field(() => Date)
  date: Date
}
