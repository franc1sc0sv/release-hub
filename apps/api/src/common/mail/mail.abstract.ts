export abstract class IMailService {
  abstract sendLoginCode(to: string, code: string, userName: string): Promise<void>
  abstract sendProjectInvitation(to: string, inviterName: string, projectName: string, acceptUrl: string): Promise<void>
}
