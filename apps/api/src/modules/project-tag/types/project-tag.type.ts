import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ProjectTagType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  color: string | null

  @Field(() => Date)
  createdAt: Date
}
