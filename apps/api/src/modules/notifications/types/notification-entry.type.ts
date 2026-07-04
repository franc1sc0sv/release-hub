import { Field, ID, ObjectType } from '@nestjs/graphql'
import { NotificationType } from '../../../common/types/notification-type.enum'

@ObjectType()
export class NotificationEntryType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  projectId: string

  @Field(() => String)
  projectName: string

  @Field(() => NotificationType)
  type: NotificationType

  @Field(() => String)
  title: string

  @Field(() => String)
  body: string

  @Field(() => String, { nullable: true })
  url: string | null

  @Field(() => String, { nullable: true })
  flagKey: string | null

  @Field(() => Date, { nullable: true })
  readAt: Date | null

  @Field(() => Date)
  createdAt: Date
}
