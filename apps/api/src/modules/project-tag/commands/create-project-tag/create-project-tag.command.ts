export class CreateProjectTagCommand {
  constructor(
    readonly projectId: string,
    readonly name: string,
    readonly color: string | null,
    readonly userId: string,
  ) {}
}
