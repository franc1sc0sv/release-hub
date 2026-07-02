export interface ISlackOAuthAccessResult {
  ok: boolean
  accessToken: string | null
  teamId: string | null
  teamName: string | null
  error: string | null
}

export interface ISlackChannel {
  id: string
  name: string
}

export interface ISlackListChannelsResult {
  ok: boolean
  channels: ISlackChannel[]
  nextCursor: string | null
  error: string | null
}

export interface ISlackPostMessageResult {
  ok: boolean
  error: string | null
}
