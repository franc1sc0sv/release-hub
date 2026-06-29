export class RejectSuggestedFeatureCommand {
  constructor(
    readonly featureId: string,
    readonly userId: string,
  ) {}
}
