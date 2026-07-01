import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagCoverageSummaryType {
  @Field(() => Int)
  flagsTracked: number

  @Field(() => Int)
  branchesScanned: number

  @Field(() => Int)
  prChangesDetected: number
}
