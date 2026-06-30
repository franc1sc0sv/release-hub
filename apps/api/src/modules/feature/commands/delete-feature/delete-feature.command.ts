export class DeleteFeatureCommand {
  constructor(
    public readonly featureId: string,
    public readonly userId: string,
  ) {}
}
