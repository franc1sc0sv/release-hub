import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ScanReleasePullRequestsSummaryType {
  @Field(() => Int)
  prsScanned: number

  @Field(() => Int)
  flagsFound: number

  @Field(() => Int)
  changesRecorded: number
}
