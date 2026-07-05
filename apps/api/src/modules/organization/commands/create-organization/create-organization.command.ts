export class CreateOrganizationCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}
