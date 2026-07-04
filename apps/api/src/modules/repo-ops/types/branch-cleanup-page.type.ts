import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BranchCleanupPageItemType } from './branch-cleanup-page-item.type'

@ObjectType()
export class BranchCleanupPageType {
  @Field(() => [BranchCleanupPageItemType])
  items: BranchCleanupPageItemType[]

  @Field(() => Int)
  totalCount: number
}
