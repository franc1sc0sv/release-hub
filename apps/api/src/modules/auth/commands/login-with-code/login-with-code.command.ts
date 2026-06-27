export class LoginWithCodeCommand {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
