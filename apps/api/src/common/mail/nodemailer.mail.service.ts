import { Injectable, BadRequestException } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { IMailService } from './mail.abstract'

const CODE_TTL_LABEL = '10 minutos'
const MAIL_SUBJECT = 'Tu código de acceso Release Hub'

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const validateHttpUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL scheme')
    }
    return parsed.toString()
  } catch {
    throw new BadRequestException('Invalid URL format')
  }
}

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

  async sendProjectInvitation(
    to: string,
    inviterName: string,
    projectName: string,
    acceptUrl: string,
  ): Promise<void> {
    const escapedInviterName = escapeHtml(inviterName)
    const escapedProjectName = escapeHtml(projectName)
    const validatedUrl = validateHttpUrl(acceptUrl)

    const subject = `${escapedInviterName} te invitó a colaborar en ${escapedProjectName}`

    const text = [
      `Hola,`,
      '',
      `${escapedInviterName} te ha invitado a colaborar en el proyecto "${escapedProjectName}" en Release Hub.`,
      '',
      `Acepta la invitación aquí: ${validatedUrl}`,
      '',
      `Si no esperabas esta invitación, puedes ignorar este correo.`,
    ].join('\n')

    const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;padding:24px">
  <p>Hola,</p>
  <p><strong>${escapedInviterName}</strong> te ha invitado a colaborar en el proyecto <strong>${escapedProjectName}</strong> en Release Hub.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${validatedUrl}" style="display:inline-block;padding:12px 24px;background:#2A2483;color:#fff;border-radius:9999px;text-decoration:none;font-weight:bold">Aceptar invitación</a>
  </div>
  <p style="font-size:12px;color:#6b7280">Si no esperabas esta invitación, puedes ignorar este correo.</p>
</body>
</html>`

    await this.transporter.sendMail({ from: this.from, to, subject, text, html })
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
