import { Field, ObjectType } from '@nestjs/graphql'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { FeatureType } from '../../feature/types/feature.type'
import { FlagStateType } from '../../feature/types/flag-state.type'
import { ReleaseObjectType } from './release.type'
import { PullRequestType } from './pull-request.type'

@ObjectType()
export class ReleaseFeatureNodeType {
  @Field(() => FeatureType)
  feature: FeatureType

  @Field(() => FeatureState)
  state: FeatureState

  @Field(() => String)
  clientAvailabilityKey: string

  @Field(() => FlagStateType, { nullable: true })
  flagState: FlagStateType | null

  @Field(() => [PullRequestType])
  prs: PullRequestType[]
}

@ObjectType()
export class ReleaseTreeType {
  @Field(() => ReleaseObjectType)
  release: ReleaseObjectType

  @Field(() => [ReleaseFeatureNodeType])
  features: ReleaseFeatureNodeType[]
}
