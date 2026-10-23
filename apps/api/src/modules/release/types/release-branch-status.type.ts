import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'

@ObjectType()
export class ReleaseBranchStatusType {
  @Field(() => String, { nullable: true })
  sourceRef: string | null

  @Field(() => Boolean)
  detected: boolean

  @Field(() => Int)
  behindBy: number

  @Field(() => Int)
  ownCommits: number

  @Field(() => Boolean)
  canFastForward: boolean

  @Field(() => BranchUpdateMethod)
  updateMethod: BranchUpdateMethod
}
