import { Field, Int, ObjectType } from '@nestjs/graphql'
import { FeatureType } from './feature.type'

@ObjectType()
export class FeaturePageType {
  @Field(() => [FeatureType])
  items!: FeatureType[]

  @Field(() => Int)
  totalCount!: number

  @Field(() => Boolean)
  hasMore!: boolean
}
