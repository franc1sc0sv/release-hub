import { Field, ID, ObjectType } from '@nestjs/graphql'
import { FeatureType } from './feature.type'
import { ReleaseObjectType } from '../../release/types/release.type'
import { PullRequestType } from '../../release/types/pull-request.type'
import { FeatureState } from '../../../common/types/feature-state.enum'

@ObjectType()
export class FeatureReleaseSnapshotType {
  @Field(() => ID)
  releaseId: string

  @Field(() => FeatureState)
  state: FeatureState
}

@ObjectType()
export class FeatureDetailType {
  @Field(() => FeatureType)
  feature: FeatureType

  @Field(() => [ReleaseObjectType])
  releases: ReleaseObjectType[]

  @Field(() => [PullRequestType])
  prs: PullRequestType[]

  @Field(() => [FeatureReleaseSnapshotType])
  snapshots: FeatureReleaseSnapshotType[]
}
