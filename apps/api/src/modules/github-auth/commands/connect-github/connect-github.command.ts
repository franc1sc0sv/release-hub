export class ConnectGithubCommand {
  constructor(
    readonly userId: string,
    readonly encryptedAccessToken: string,
    readonly refreshToken: string | null,
    readonly expiresAt: Date | null,
    readonly githubUserId: string,
    readonly githubLogin: string,
    readonly scopes: string | null,
  ) {}
}
