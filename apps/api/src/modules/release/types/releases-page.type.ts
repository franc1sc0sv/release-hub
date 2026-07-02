import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ReleaseObjectType } from './release.type'

@ObjectType()
export class ReleasesPageType {
  @Field(() => [ReleaseObjectType])
  items: ReleaseObjectType[]

  @Field(() => Int)
  totalCount: number

  @Field(() => Boolean)
  hasMore: boolean
}
