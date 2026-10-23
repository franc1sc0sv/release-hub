import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'

@ObjectType()
export class UpdateReleaseBranchResultType {
  @Field(() => BranchUpdateMethod)
  method: BranchUpdateMethod

  @Field(() => String)
  sourceRef: string

  @Field(() => Int)
  commitsAdded: number

  @Field(() => String)
  headSha: string
}
