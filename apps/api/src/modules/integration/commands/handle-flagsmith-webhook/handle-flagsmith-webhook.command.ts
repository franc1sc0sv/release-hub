import type { IFlagsmithWebhookPayload } from '../../interfaces/flagsmith-webhook.interfaces'

export class HandleFlagsmithWebhookCommand {
  constructor(
    public readonly projectId: string,
    public readonly payload: IFlagsmithWebhookPayload,
  ) {}
}
