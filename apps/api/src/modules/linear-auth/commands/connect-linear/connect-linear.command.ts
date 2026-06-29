export class ConnectLinearCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly encryptedAccessToken: string,
    readonly encryptedRefreshToken: string | null,
    readonly expiresAt: Date | null,
    readonly linearUserId: string,
    readonly linearUserName: string,
    readonly scopes: string | null,
  ) {}
}
