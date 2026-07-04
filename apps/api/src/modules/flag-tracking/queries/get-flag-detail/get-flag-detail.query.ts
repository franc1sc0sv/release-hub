export class GetFlagDetailQuery {
  constructor(
    readonly projectId: string,
    readonly key: string,
    readonly userId: string,
  ) {}
}
