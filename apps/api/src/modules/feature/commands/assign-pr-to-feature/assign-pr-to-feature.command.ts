export class AssignPrToFeatureCommand {
  constructor(
    readonly prId: string,
    readonly featureId: string,
    readonly userId: string,
  ) {}
}
