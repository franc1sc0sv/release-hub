import { Field, ID, ObjectType } from '@nestjs/graphql'
import { FlagClosedReason } from '../../../common/types/flag-closed-reason.enum'

@ObjectType()
export class TrackedFlagClosureType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  key: string

  @Field(() => Date, { nullable: true })
  closedAt: Date | null

  @Field(() => FlagClosedReason, { nullable: true })
  closedReason: FlagClosedReason | null
}
