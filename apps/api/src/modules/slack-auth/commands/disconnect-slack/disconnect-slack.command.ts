export class DisconnectSlackCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
