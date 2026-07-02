export class ConnectSlackCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly encryptedAccessToken: string,
    readonly slackTeamId: string,
    readonly slackTeamName: string,
  ) {}
}
