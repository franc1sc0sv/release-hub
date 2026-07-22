import { Field, ID, ObjectType } from '@nestjs/graphql'
import { SummaryExampleKind } from '../../../common/types/summary-example-kind.enum'

@ObjectType()
export class SummaryProfileExampleType {
  @Field(() => ID)
  id: string

  @Field(() => SummaryExampleKind)
  kind: SummaryExampleKind

  @Field(() => String)
  content: string

  @Field(() => String)
  explanation: string
}
