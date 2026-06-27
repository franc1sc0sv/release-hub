export abstract class IMailService {
  abstract sendLoginCode(to: string, code: string, userName: string): Promise<void>
}
