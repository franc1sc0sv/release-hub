import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BranchBlockReason } from '../interfaces/repo-ops.interfaces'

@ObjectType()
export class BranchCleanupPlanDeletableType {
  @Field(() => String)
  name: string

  @Field(() => Date, { nullable: true })
  lastCommitAt: Date | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorLogin: string | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorName: string | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorAvatarUrl: string | null
}

@ObjectType()
export class BranchCleanupPlanKeptType {
  @Field(() => String)
  name: string

  @Field(() => [BranchBlockReason])
  blockReasons: BranchBlockReason[]
}

@ObjectType()
export class BranchCleanupPlanType {
  @Field(() => [BranchCleanupPlanDeletableType])
  deletable: BranchCleanupPlanDeletableType[]

  @Field(() => [BranchCleanupPlanKeptType])
  kept: BranchCleanupPlanKeptType[]

  @Field(() => Int)
  totalCount: number
}
