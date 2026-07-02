import { Field, Int, ObjectType } from '@nestjs/graphql'
import { PullRequestType } from './pull-request.type'

@ObjectType()
export class ReleasePullRequestsPageType {
  @Field(() => [PullRequestType])
  items: PullRequestType[]

  @Field(() => Int)
  totalCount: number

  @Field(() => Boolean)
  hasMore: boolean
}
