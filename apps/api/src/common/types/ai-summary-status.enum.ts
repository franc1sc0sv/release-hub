import { registerEnumType } from '@nestjs/graphql'

export const AiSummaryStatus = {
  IDLE: 'idle',
  GENERATING: 'generating',
  READY: 'ready',
  FAILED: 'failed',
} as const

export type AiSummaryStatus = (typeof AiSummaryStatus)[keyof typeof AiSummaryStatus]

registerEnumType(AiSummaryStatus, { name: 'AiSummaryStatus' })
