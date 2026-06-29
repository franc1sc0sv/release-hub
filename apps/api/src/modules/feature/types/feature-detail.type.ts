import { Field, ObjectType } from '@nestjs/graphql'
import { FeatureType } from './feature.type'
import { ReleaseObjectType } from '../../release/types/release.type'
import { PullRequestType } from '../../release/types/pull-request.type'

@ObjectType()
export class FeatureDetailType {
  @Field(() => FeatureType)
  feature: FeatureType

  @Field(() => [ReleaseObjectType])
  releases: ReleaseObjectType[]

  @Field(() => [PullRequestType])
  prs: PullRequestType[]
}
