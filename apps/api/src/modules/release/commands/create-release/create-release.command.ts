export class CreateReleaseCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly baseRef: string,
    readonly compareRef: string,
    readonly tags: string[],
  ) {}
}
