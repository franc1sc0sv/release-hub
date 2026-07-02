import type {
  ISlackOAuthAccessResult,
  ISlackListChannelsResult,
  ISlackPostMessageResult,
} from './slack-api.interfaces'

export abstract class ISlackApiClient {
  abstract exchangeCodeForToken(code: string, redirectUri: string): Promise<ISlackOAuthAccessResult>
  abstract listChannels(accessToken: string, cursor: string | null): Promise<ISlackListChannelsResult>
  abstract postMessage(accessToken: string, channelId: string, text: string): Promise<ISlackPostMessageResult>
}
