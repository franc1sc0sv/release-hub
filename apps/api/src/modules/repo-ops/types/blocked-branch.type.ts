import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class BlockedBranchType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  projectId: string

  @Field(() => String)
  branchName: string

  @Field(() => String, { nullable: true })
  reason: string | null

  @Field(() => ID)
  createdById: string

  @Field(() => Date)
  createdAt: Date
}
