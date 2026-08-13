import { Field, ID, ObjectType } from '@nestjs/graphql'
import { FeatureState } from '../../../common/types/feature-state.enum'
import {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../common/types/feature-timeline.enum'

@ObjectType()
export class FeatureTimelineEntryType {
  @Field(() => ID)
  id: string

  @Field(() => ID, { nullable: true })
  releaseId: string | null

  @Field(() => String, { nullable: true })
  releaseName: string | null

  @Field(() => FeatureTimelineScope)
  scope: FeatureTimelineScope

  @Field(() => FeatureTimelineSource)
  source: FeatureTimelineSource

  @Field(() => FeatureState, { nullable: true })
  fromState: FeatureState | null

  @Field(() => FeatureState)
  toState: FeatureState

  @Field(() => String, { nullable: true })
  actorName: string | null

  @Field(() => String, { nullable: true })
  flagKey: string | null

  @Field(() => Date)
  occurredAt: Date
}
