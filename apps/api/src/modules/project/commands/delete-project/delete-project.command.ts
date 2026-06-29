export class DeleteProjectCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
