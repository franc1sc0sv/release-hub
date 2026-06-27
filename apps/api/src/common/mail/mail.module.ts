import { Global, Module } from '@nestjs/common'
import { IMailService } from './mail.abstract'
import { NodemailerMailService } from './nodemailer.mail.service'

@Global()
@Module({
  providers: [{ provide: IMailService, useClass: NodemailerMailService }],
  exports: [IMailService],
})
export class MailModule {}
