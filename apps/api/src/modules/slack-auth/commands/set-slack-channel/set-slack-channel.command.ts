export class SetSlackChannelCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly channelId: string,
    readonly channelName: string,
  ) {}
}
