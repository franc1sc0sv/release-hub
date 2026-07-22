import { Injectable, Logger } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { IMailService } from './mail.abstract'
import { renderBrandedEmail } from './email-template'

const CODE_TTL_LABEL = '10 minutes'
const LOGIN_CODE_SUBJECT = 'Your Release Hub access code'
const WEB_APP_URL = (process.env.WEB_APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `${WEB_APP_URL}/${url.replace(/^\/+/, '')}`
}

@Injectable()
export class NodemailerMailService extends IMailService {
  private readonly logger = new Logger(NodemailerMailService.name)
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>
  private readonly from: string

  constructor() {
    super()

    const mailFrom = process.env.MAIL_FROM
    if (!mailFrom) throw new Error('MAIL_FROM environment variable is required')

    this.from = mailFrom

    const smtpUser = process.env.SMTP_USER || undefined
    const smtpPass = process.env.SMTP_PASS || undefined

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
    const secure = process.env.SMTP_SECURE === 'true'

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    })

    this.logger.log(
      `SMTP configured host=${host} port=${port} secure=${secure} auth=${smtpUser && smtpPass ? 'yes' : 'no'}`,
    )

    this.transporter
      .verify()
      .then(() => this.logger.log(`SMTP transport ready host=${host} port=${port}`))
      .catch((error) =>
        this.logger.error(
          `SMTP transport verify failed host=${host} port=${port}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
  }

  private async deliver(message: nodemailer.SendMailOptions): Promise<void> {
    this.logger.log(`sending mail to=${String(message.to)} subject=${String(message.subject)}`)
    const info = await this.transporter.sendMail(message)
    this.logger.log(
      `mail sent messageId=${info.messageId} response=${info.response} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)}`,
    )
  }

  async sendProjectInvitation(
    to: string,
    inviterName: string,
    projectName: string,
    acceptUrl: string,
  ): Promise<void> {
    const subject = `${inviterName} invited you to collaborate on ${projectName}`

    const { html, text } = renderBrandedEmail({
      title: 'You have been invited to Release Hub',
      paragraphs: [`Hi,`, `${inviterName} invited you to collaborate on the ${projectName} organization.`],
      cta: { label: 'Accept invitation', url: acceptUrl },
      footerNote: "If you weren't expecting this invitation, you can safely ignore this email.",
    })

    await this.deliver({ from: this.from, to, subject, text, html })
  }

  async sendLoginCode(to: string, code: string, userName: string): Promise<void> {
    const { html, text } = renderBrandedEmail({
      title: 'Your access code',
      paragraphs: [`Hi ${userName},`, 'Your access code is:'],
      codeBlock: code,
      footerNote: `This code expires in ${CODE_TTL_LABEL}. If you didn't request this, you can safely ignore this email.`,
    })

    await this.deliver({
      from: this.from,
      to,
      subject: LOGIN_CODE_SUBJECT,
      text,
      html,
    })
  }

  async sendNotification(
    to: string,
    subject: string,
    title: string,
    bodyLines: string[],
    url: string | null,
  ): Promise<void> {
    const { html, text } = renderBrandedEmail({
      title,
      paragraphs: bodyLines,
      cta: url ? { label: 'View details', url: toAbsoluteUrl(url) } : undefined,
    })

    await this.deliver({ from: this.from, to, subject, text, html })
  }
}
