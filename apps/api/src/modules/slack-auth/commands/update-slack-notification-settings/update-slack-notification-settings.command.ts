export class UpdateSlackNotificationSettingsCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly notifyOnCreated: boolean,
    readonly notifyOnShipped: boolean,
    readonly notifyOnDeployed: boolean,
  ) {}
}
