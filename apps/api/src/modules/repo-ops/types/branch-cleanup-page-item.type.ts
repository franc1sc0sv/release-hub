import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { BranchBlockReason } from '../interfaces/repo-ops.interfaces'

registerEnumType(BranchBlockReason, { name: 'BranchBlockReason' })

@ObjectType()
export class BranchCleanupPageSignalsType {
  @Field(() => Boolean)
  mergedViaPr: boolean

  @Field(() => Boolean)
  noOpenPr: boolean

  @Field(() => Boolean)
  unreferencedByReleases: boolean
}

@ObjectType()
export class BranchCleanupPageItemType {
  @Field(() => String)
  name: string

  @Field(() => Boolean)
  isDefault: boolean

  @Field(() => Boolean)
  githubProtected: boolean

  @Field(() => Date, { nullable: true })
  lastCommitAt: Date | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorLogin: string | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorName: string | null

  @Field(() => String, { nullable: true })
  lastCommitAuthorAvatarUrl: string | null

  @Field(() => Int, { nullable: true })
  openPullRequestNumber: number | null

  @Field(() => String, { nullable: true })
  openPullRequestUrl: string | null

  @Field(() => BranchCleanupPageSignalsType)
  signals: BranchCleanupPageSignalsType

  @Field(() => [BranchBlockReason])
  blockReasons: BranchBlockReason[]

  @Field(() => Boolean)
  deletable: boolean

  @Field(() => Boolean)
  overridable: boolean
}
