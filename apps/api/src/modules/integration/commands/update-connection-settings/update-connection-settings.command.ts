export class UpdateConnectionSettingsCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly flagsmithApiKey: string | null | undefined,
    public readonly flagsmithUrl: string | null | undefined,
    public readonly flagsmithProjectId: string | null | undefined,
  ) {}
}
