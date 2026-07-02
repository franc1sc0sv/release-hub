import { Field, ID, InputType } from '@nestjs/graphql'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { NotificationType } from '../../../../common/types/notification-type.enum'
import { NotificationChannel } from '../../../../common/types/notification-channel.enum'
import { DigestFrequency } from '../../../../common/types/digest-frequency.enum'

@InputType()
export class UpdateNotificationPreferenceInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  notificationType: NotificationType

  @Field(() => NotificationChannel)
  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @Field(() => Boolean)
  @IsBoolean()
  enabled: boolean

  @Field(() => DigestFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(DigestFrequency)
  digestFrequency?: DigestFrequency
}
