export const FlagsmithWebhookEventType = {
  FLAG_UPDATED: 'FLAG_UPDATED',
  FLAG_DELETED: 'FLAG_DELETED',
} as const

export type FlagsmithWebhookEventType = (typeof FlagsmithWebhookEventType)[keyof typeof FlagsmithWebhookEventType]

export interface IFlagsmithWebhookFeature {
  id: number
  name: string
}

export interface IFlagsmithWebhookEnvironment {
  name: string
}

export interface IFlagsmithWebhookFeatureState {
  feature: IFlagsmithWebhookFeature
  environment: IFlagsmithWebhookEnvironment
  enabled: boolean
  feature_state_value?: string | number | boolean | null
}

export interface IFlagsmithWebhookPayload {
  event_type: FlagsmithWebhookEventType
  data: {
    new_state?: IFlagsmithWebhookFeatureState
    previous_state?: IFlagsmithWebhookFeatureState
  }
}

export interface IParsedFlagsmithWebhookEvent {
  eventType: FlagsmithWebhookEventType
  featureKey: string
  environmentName: string
  enabled: boolean
  value: string | null
}
