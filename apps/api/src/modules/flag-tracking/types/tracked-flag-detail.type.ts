import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { ReleaseStatus } from '../../../common/types/release-status.enum'
import { FlagChangeAction } from '../../../common/types/flag-change-action.enum'
import { FlagReferenceKind } from '../../../common/types/flag-reference-kind.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'
import { TrackedFlagFeatureType } from './tracked-flag.type'

@ObjectType()
export class FlagBranchPresenceDetailType {
  @Field(() => String)
  branch: string

  @Field(() => Boolean)
  present: boolean

  @Field(() => Date)
  firstSeenAt: Date

  @Field(() => Date)
  lastConfirmedAt: Date
}

@ObjectType()
export class TrackedFlagPullRequestChangeType {
  @Field(() => Int)
  prNumber: number

  @Field(() => String)
  prTitle: string

  @Field(() => String)
  prAuthor: string

  @Field(() => Date)
  prMergedAt: Date

  @Field(() => FlagChangeAction)
  action: FlagChangeAction

  @Field(() => FlagReferenceKind)
  kind: FlagReferenceKind

  @Field(() => String, { nullable: true })
  detectedFile: string | null
}

@ObjectType()
export class TrackedFlagReleaseType {
  @Field(() => ID)
  releaseId: string

  @Field(() => String)
  version: string

  @Field(() => ReleaseStatus)
  status: ReleaseStatus

  @Field(() => Date)
  date: Date

  @Field(() => ReleaseFlagDecisionType, { nullable: true })
  decision: ReleaseFlagDecisionType | null
}

@ObjectType()
export class TrackedFlagDeliveryType {
  @Field(() => Boolean)
  inDefaultBranch: boolean

  @Field(() => [String])
  shippedReleaseVersions: string[]
}

@ObjectType()
export class TrackedFlagEventType {
  @Field(() => String)
  type: string

  @Field(() => Date)
  occurredAt: Date

  @Field(() => String)
  description: string
}

@ObjectType()
export class TrackedFlagDetailType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  key: string

  @Field(() => Boolean)
  presentInCode: boolean

  @Field(() => TrackedFlagFeatureType, { nullable: true })
  feature: TrackedFlagFeatureType | null

  @Field(() => [FlagBranchPresenceDetailType])
  branchPresences: FlagBranchPresenceDetailType[]

  @Field(() => [TrackedFlagPullRequestChangeType])
  pullRequestChanges: TrackedFlagPullRequestChangeType[]

  @Field(() => [TrackedFlagReleaseType])
  releases: TrackedFlagReleaseType[]

  @Field(() => TrackedFlagDeliveryType)
  delivery: TrackedFlagDeliveryType

  @Field(() => [TrackedFlagEventType])
  events: TrackedFlagEventType[]
}
