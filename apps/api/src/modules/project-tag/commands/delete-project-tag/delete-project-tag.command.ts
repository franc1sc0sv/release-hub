export class DeleteProjectTagCommand {
  constructor(
    readonly tagId: string,
    readonly userId: string,
  ) {}
}
