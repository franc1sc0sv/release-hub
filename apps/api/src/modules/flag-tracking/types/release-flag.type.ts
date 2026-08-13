import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { FlagChangeAction } from '../../../common/types/flag-change-action.enum'
import { FlagReferenceKind } from '../../../common/types/flag-reference-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'
import { TrackedFlagFeatureType } from './tracked-flag.type'

@ObjectType()
export class ReleaseFlagChangeType {
  @Field(() => FlagReferenceKind)
  kind: FlagReferenceKind

  @Field(() => FlagChangeAction)
  action: FlagChangeAction

  @Field(() => String, { nullable: true })
  detectedFile: string | null

  @Field(() => Int)
  prNumber: number

  @Field(() => String)
  prTitle: string

  @Field(() => String)
  prUrl: string
}

@ObjectType()
export class ReleaseFlagType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  key: string

  @Field(() => TrackedFlagFeatureType, { nullable: true })
  feature: TrackedFlagFeatureType | null

  @Field(() => [ReleaseFlagChangeType])
  changes: ReleaseFlagChangeType[]

  @Field(() => ReleaseFlagDecisionType, { nullable: true })
  decision: ReleaseFlagDecisionType | null

  @Field(() => Date, { nullable: true })
  decidedAt: Date | null

  @Field(() => FeatureState, { nullable: true })
  suggestedFeatureState: FeatureState | null

  @Field(() => FeatureState, { nullable: true })
  featureReleaseState: FeatureState | null
}
