import { registerEnumType } from '@nestjs/graphql'

export const TicketSource = {
  LINEAR: 'LINEAR',
  JIRA: 'JIRA',
} as const

export type TicketSource = (typeof TicketSource)[keyof typeof TicketSource]

registerEnumType(TicketSource, { name: 'TicketSource' })
