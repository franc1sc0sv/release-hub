import { Field, Int, ObjectType } from '@nestjs/graphql'
import { NotificationEntryType } from './notification-entry.type'

@ObjectType()
export class NotificationsPageType {
  @Field(() => [NotificationEntryType])
  items!: NotificationEntryType[]

  @Field(() => Int)
  totalCount!: number

  @Field(() => Boolean)
  hasMore!: boolean
}
