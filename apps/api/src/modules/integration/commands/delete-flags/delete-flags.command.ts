export class DeleteFlagsCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly flagKeys: string[],
  ) {}
}
