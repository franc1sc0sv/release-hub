import { Field, ObjectType } from '@nestjs/graphql'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { NotificationChannel } from '../../../common/types/notification-channel.enum'
import { DigestFrequency } from '../../../common/types/digest-frequency.enum'

@ObjectType()
export class NotificationPreferenceEntryType {
  @Field(() => NotificationType)
  notificationType: NotificationType

  @Field(() => NotificationChannel)
  channel: NotificationChannel

  @Field(() => Boolean)
  enabled: boolean

  @Field(() => DigestFrequency)
  digestFrequency: DigestFrequency
}
