export class RotateGithubWebhookSecretCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
