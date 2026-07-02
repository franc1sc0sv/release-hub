const SLACK_API_BASE_URL = 'https://slack.com/api'

interface ISlackApiResponse {
  ok: boolean
  error?: string
}

interface ISlackPostMessageResponse extends ISlackApiResponse {
  channel?: string
  ts?: string
}

interface ISlackLookupByEmailResponse extends ISlackApiResponse {
  user?: { id: string }
}

interface ISlackOpenConversationResponse extends ISlackApiResponse {
  channel?: { id: string }
}

async function callSlackApi<TResponse extends ISlackApiResponse>(
  method: string,
  accessToken: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const response = await fetch(`${SLACK_API_BASE_URL}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  })
  return (await response.json()) as TResponse
}

export class SlackHttpClient {
  async postMessage(accessToken: string, channel: string, text: string): Promise<ISlackPostMessageResponse> {
    return callSlackApi<ISlackPostMessageResponse>('chat.postMessage', accessToken, { channel, text })
  }

  async lookupUserByEmail(accessToken: string, email: string): Promise<ISlackLookupByEmailResponse> {
    return callSlackApi<ISlackLookupByEmailResponse>('users.lookupByEmail', accessToken, { email })
  }

  async openConversation(accessToken: string, userId: string): Promise<ISlackOpenConversationResponse> {
    return callSlackApi<ISlackOpenConversationResponse>('conversations.open', accessToken, { users: userId })
  }
}
