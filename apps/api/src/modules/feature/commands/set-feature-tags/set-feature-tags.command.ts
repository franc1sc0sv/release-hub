export class SetFeatureTagsCommand {
  constructor(
    readonly featureId: string,
    readonly tags: string[],
    readonly userId: string,
  ) {}
}
