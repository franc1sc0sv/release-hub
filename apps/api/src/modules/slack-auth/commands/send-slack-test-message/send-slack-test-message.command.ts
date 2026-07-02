export class SendSlackTestMessageCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
