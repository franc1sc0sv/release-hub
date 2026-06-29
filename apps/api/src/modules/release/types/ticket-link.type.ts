import { Field, Float, ObjectType } from '@nestjs/graphql'
import { TicketSource } from '../../../common/types/ticket-source.enum'

@ObjectType()
export class TicketLinkType {
  @Field(() => String)
  issueId: string

  @Field(() => TicketSource)
  source: TicketSource

  @Field(() => String)
  url: string

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  description: string | null

  @Field(() => Float)
  confidence: number
}
