export class SetFlagRegistryCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly path: string,
    readonly branch: string | null,
  ) {}
}
