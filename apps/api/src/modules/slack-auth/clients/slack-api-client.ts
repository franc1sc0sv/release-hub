import { Injectable } from '@nestjs/common'
import { ISlackApiClient } from '../interfaces/slack-api-client'
import type {
  ISlackOAuthAccessResult,
  ISlackListChannelsResult,
  ISlackPostMessageResult,
  ISlackChannel,
} from '../interfaces/slack-api.interfaces'

interface ISlackOAuthAccessResponse {
  ok: boolean
  access_token?: string
  team?: { id?: string; name?: string }
  error?: string
}

interface ISlackConversationsListResponse {
  ok: boolean
  channels?: { id: string; name: string }[]
  response_metadata?: { next_cursor?: string }
  error?: string
}

interface ISlackPostMessageResponse {
  ok: boolean
  error?: string
}

const CHANNELS_PAGE_LIMIT = 200

@Injectable()
export class SlackApiClient extends ISlackApiClient {
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<ISlackOAuthAccessResult> {
    const clientId = process.env.SLACK_CLIENT_ID!
    const clientSecret = process.env.SLACK_CLIENT_SECRET!

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const data = (await response.json()) as ISlackOAuthAccessResponse

    if (!data.ok || !data.access_token) {
      return {
        ok: false,
        accessToken: null,
        teamId: null,
        teamName: null,
        error: data.error ?? 'unknown_error',
      }
    }

    return {
      ok: true,
      accessToken: data.access_token,
      teamId: data.team?.id ?? null,
      teamName: data.team?.name ?? null,
      error: null,
    }
  }

  async listChannels(accessToken: string, cursor: string | null): Promise<ISlackListChannelsResult> {
    const params = new URLSearchParams({
      types: 'public_channel',
      limit: String(CHANNELS_PAGE_LIMIT),
    })
    if (cursor) params.set('cursor', cursor)

    const response = await fetch(`https://slack.com/api/conversations.list?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = (await response.json()) as ISlackConversationsListResponse

    if (!data.ok) {
      return { ok: false, channels: [], nextCursor: null, error: data.error ?? 'unknown_error' }
    }

    const channels: ISlackChannel[] = (data.channels ?? []).map((channel) => ({
      id: channel.id,
      name: channel.name,
    }))

    return {
      ok: true,
      channels,
      nextCursor: data.response_metadata?.next_cursor || null,
      error: null,
    }
  }

  async postMessage(accessToken: string, channelId: string, text: string): Promise<ISlackPostMessageResult> {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ channel: channelId, text }),
    })

    const data = (await response.json()) as ISlackPostMessageResponse

    if (!data.ok) {
      return { ok: false, error: data.error ?? 'unknown_error' }
    }

    return { ok: true, error: null }
  }
}
