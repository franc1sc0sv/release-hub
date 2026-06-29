export class CompareFlagsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly baselineEnvironments: string[],
    public readonly comparedEnvironments: string[],
  ) {}
}
