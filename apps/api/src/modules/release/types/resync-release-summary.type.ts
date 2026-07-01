import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ResyncReleaseSummaryType {
  @Field(() => Int)
  newPrsAdded: number
}
