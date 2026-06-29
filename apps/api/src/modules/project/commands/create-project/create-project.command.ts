export class CreateProjectCommand {
  constructor(
    readonly userId: string,
    readonly name: string,
    readonly repo: string,
  ) {}
}
