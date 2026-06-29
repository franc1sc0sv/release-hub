import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

export const IntegrationStatus = {
  CONNECTED: 'CONNECTED',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
} as const

export type IntegrationStatus = (typeof IntegrationStatus)[keyof typeof IntegrationStatus]

registerEnumType(IntegrationStatus, { name: 'IntegrationStatus' })

@ObjectType()
export class ConnectionHealthType {
  @Field(() => IntegrationStatus)
  github: IntegrationStatus

  @Field(() => IntegrationStatus)
  linear: IntegrationStatus

  @Field(() => IntegrationStatus)
  flagsmith: IntegrationStatus
}
