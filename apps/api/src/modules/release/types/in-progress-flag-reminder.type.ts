import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class InProgressFlagReminderType {
  @Field(() => ID)
  trackedFlagId: string

  @Field(() => String)
  key: string

  @Field(() => ID, { nullable: true })
  featureId: string | null

  @Field(() => ID)
  releaseId: string

  @Field(() => String)
  releaseVersion: string

  @Field(() => Date, { nullable: true })
  decidedAt: Date | null
}
