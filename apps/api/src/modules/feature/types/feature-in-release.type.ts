import { Field, ID, ObjectType } from '@nestjs/graphql'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { FlagStateType } from './flag-state.type'

@ObjectType()
export class FeatureInReleaseType {
  @Field(() => ID)
  featureId: string

  @Field(() => ID)
  releaseId: string

  @Field(() => FeatureState)
  state: FeatureState

  @Field(() => FlagStateType, { nullable: true })
  flagState: FlagStateType | null

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  clientAvailabilityKey: string
}
