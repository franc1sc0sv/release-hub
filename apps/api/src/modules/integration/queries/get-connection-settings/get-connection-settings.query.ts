export class GetConnectionSettingsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
