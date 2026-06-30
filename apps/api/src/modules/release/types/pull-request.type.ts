import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql'
import { CommitType } from './commit.type'
import { TicketLinkType } from './ticket-link.type'

@ObjectType()
export class PullRequestType {
  @Field(() => ID)
  id: string

  @Field(() => Int)
  number: number

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  body: string | null

  @Field(() => String)
  author: string

  @Field(() => Date)
  mergedAt: Date

  @Field(() => ID, { nullable: true })
  releaseId: string | null

  @Field(() => ID, { nullable: true })
  featureId: string | null

  @Field(() => Float, { nullable: true })
  aiConfidence: number | null

  @Field(() => String, { nullable: true })
  aiRationale: string | null

  @Field(() => String, { nullable: true })
  summary: string | null

  @Field(() => Date, { nullable: true })
  summaryEditedAt: Date | null

  @Field(() => [CommitType])
  commits: CommitType[]

  @Field(() => [TicketLinkType])
  tickets: TicketLinkType[]

  @Field(() => String)
  url: string
}
