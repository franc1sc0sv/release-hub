export class CreateFeatureCommand {
  constructor(
    readonly projectId: string,
    readonly name: string,
    readonly description: string,
    readonly userId: string,
    readonly tags?: string[],
  ) {}
}
