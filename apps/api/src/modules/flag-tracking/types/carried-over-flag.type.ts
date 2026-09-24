import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'

@ObjectType()
export class CarriedOverFlagPullRequestType {
  @Field(() => Int)
  number: number

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  url: string | null
}

@ObjectType()
export class CarriedOverFlagType {
  @Field(() => ID)
  trackedFlagId: string

  @Field(() => String)
  key: string

  @Field(() => ID, { nullable: true })
  featureId: string | null

  @Field(() => String, { nullable: true })
  featureName: string | null

  @Field(() => FeatureKind, { nullable: true })
  featureKind: FeatureKind | null

  @Field(() => CarriedOverFlagPullRequestType, { nullable: true })
  addedInPullRequest: CarriedOverFlagPullRequestType | null

  @Field(() => ID)
  originReleaseId: string

  @Field(() => String)
  originReleaseName: string

  @Field(() => ReleaseFlagDecisionType)
  decision: ReleaseFlagDecisionType

  @Field(() => FlagDeploymentStatus)
  deploymentStatus: FlagDeploymentStatus

  @Field(() => Date, { nullable: true })
  decidedAt: Date | null

  @Field(() => Boolean)
  decidedInThisRelease: boolean

  @Field(() => FeatureState, { nullable: true })
  featureReleaseState: FeatureState | null
}
