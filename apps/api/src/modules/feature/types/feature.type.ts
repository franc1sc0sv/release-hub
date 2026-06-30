import { Field, ID, ObjectType } from '@nestjs/graphql'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'

@ObjectType()
export class FeatureType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  projectId: string

  @Field(() => String)
  name: string

  @Field(() => String)
  description: string

  @Field(() => FeatureKind)
  kind: FeatureKind

  @Field(() => [String])
  tags: string[]

  @Field(() => Boolean)
  suggested: boolean

  @Field(() => FeatureState)
  currentState: FeatureState

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
