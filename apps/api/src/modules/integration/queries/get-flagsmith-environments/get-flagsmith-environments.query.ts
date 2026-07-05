export class GetFlagsmithEnvironmentsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
