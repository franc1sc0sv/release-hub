import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeleteBranchOutcomeType {
  @Field(() => String)
  branchName: string

  @Field(() => Boolean)
  deleted: boolean

  @Field(() => String, { nullable: true })
  reason: string | null
}
