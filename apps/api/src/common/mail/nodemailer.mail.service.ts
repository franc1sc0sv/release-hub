import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { IMailService } from './mail.abstract'

const CODE_TTL_LABEL = '10 minutos'
const MAIL_SUBJECT = 'Tu código de acceso Release Hub'

@Injectable()
export class NodemailerMailService extends IMailService {
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor() {
    super()

    const mailFrom = process.env.MAIL_FROM
    if (!mailFrom) throw new Error('MAIL_FROM environment variable is required')

    this.from = mailFrom

    const smtpUser = process.env.SMTP_USER || undefined
    const smtpPass = process.env.SMTP_PASS || undefined

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    })
  }

  async sendLoginCode(to: string, code: string, userName: string): Promise<void> {
    const text = [
      `Hola ${userName},`,
      '',
      'Tu código de acceso es:',
      '',
      code,
      '',
      `Este código expira en ${CODE_TTL_LABEL}. Si no lo solicitaste, ignora este correo.`,
    ].join('\n')

    const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;padding:24px">
  <p>Hola ${userName},</p>
  <p>Tu código de acceso es:</p>
  <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f4f4f5;border-radius:8px;margin:24px 0">${code}</div>
  <p>Este código expira en ${CODE_TTL_LABEL}. Si no lo solicitaste, ignora este correo.</p>
</body>
</html>`

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: MAIL_SUBJECT,
      text,
      html,
    })
  }
}
