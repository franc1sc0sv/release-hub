export class AcceptSuggestedFeatureCommand {
  constructor(
    readonly featureId: string,
    readonly userId: string,
    readonly name: string | null,
    readonly description: string | null,
    readonly tags: string[] | null,
  ) {}
}
