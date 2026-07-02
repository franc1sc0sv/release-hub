import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class BranchCleanupSignalsType {
  @Field(() => Boolean)
  mergedViaPr: boolean

  @Field(() => Boolean)
  stale: boolean

  @Field(() => Boolean)
  unreferencedByReleases: boolean

  @Field(() => Boolean)
  noOpenPr: boolean

  @Field(() => Boolean)
  blocked: boolean

  @Field(() => Boolean)
  isDefault: boolean
}

@ObjectType()
export class BranchCleanupCandidateType {
  @Field(() => String)
  name: string

  @Field(() => Date, { nullable: true })
  lastCommitDate: Date | null

  @Field(() => Boolean)
  protected: boolean

  @Field(() => BranchCleanupSignalsType)
  signals: BranchCleanupSignalsType

  @Field(() => Boolean)
  suggested: boolean
}
