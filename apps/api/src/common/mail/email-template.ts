import { BadRequestException } from '@nestjs/common'

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const validateHttpUrl = (url: string): string => {
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

const safeHttpUrl = (url: string): string | null => {
  try {
    return validateHttpUrl(url)
  } catch {
    return null
  }
}

export interface IBrandedEmailCta {
  label: string
  url: string
}

export interface IBrandedEmailContent {
  title: string
  paragraphs: string[]
  codeBlock?: string
  cta?: IBrandedEmailCta
  footerNote?: string
}

export interface IRenderedEmail {
  html: string
  text: string
}

const BACKGROUND_COLOR = '#0B0B1E'
const CARD_COLOR = '#14142B'
const ACCENT_INDIGO = '#2A2483'
const ACCENT_MAGENTA = '#EC1E8C'
const TEXT_PRIMARY = '#F5F5FA'
const TEXT_MUTED = '#9A97B8'
const FONT_STACK = 'Helvetica,Arial,sans-serif'

export function renderBrandedEmail(content: IBrandedEmailContent): IRenderedEmail {
  const escapedTitle = escapeHtml(content.title)
  const escapedParagraphs = content.paragraphs.map(escapeHtml)
  const escapedCodeBlock = content.codeBlock ? escapeHtml(content.codeBlock) : null
  const validatedCtaUrl = content.cta ? safeHttpUrl(content.cta.url) : null
  const escapedCtaLabel = content.cta ? escapeHtml(content.cta.label) : null
  const escapedFooterNote = content.footerNote ? escapeHtml(content.footerNote) : null

  const paragraphsHtml = escapedParagraphs
    .map(
      (paragraph) =>
        `<tr><td style="padding:0 40px 16px;font-size:15px;line-height:24px;color:${TEXT_PRIMARY};font-family:${FONT_STACK}">${paragraph}</td></tr>`,
    )
    .join('')

  const codeBlockHtml = escapedCodeBlock
    ? `<tr><td style="padding:8px 40px 24px">
        <div style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;color:${TEXT_PRIMARY};background-color:#1F1F3D;border-radius:8px;padding:20px">${escapedCodeBlock}</div>
      </td></tr>`
    : ''

  const ctaHtml =
    validatedCtaUrl && escapedCtaLabel
      ? `<tr><td style="padding:8px 40px 32px" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" bgcolor="${ACCENT_INDIGO}" style="border-radius:8px">
              <a href="${validatedCtaUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};border-radius:8px">${escapedCtaLabel}</a>
            </td>
          </tr>
        </table>
      </td></tr>`
      : ''

  const footerHtml = escapedFooterNote
    ? `<tr><td style="padding:24px 40px 0;font-size:12px;line-height:18px;color:${TEXT_MUTED};font-family:${FONT_STACK};border-top:1px solid #2A2A45">${escapedFooterNote}</td></tr>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${BACKGROUND_COLOR}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BACKGROUND_COLOR}">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px;max-width:100%;background-color:${CARD_COLOR};border-radius:16px;overflow:hidden">
          <tr>
            <td style="height:6px;line-height:6px;font-size:0;background-color:${ACCENT_INDIGO};background-image:linear-gradient(90deg, ${ACCENT_INDIGO}, ${ACCENT_MAGENTA})">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 40px 8px" align="left">
              <span style="font-family:${FONT_STACK};font-size:14px;font-weight:bold;letter-spacing:1px;color:${TEXT_MUTED};text-transform:uppercase">Release Hub</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px">
              <h1 style="margin:0;font-family:${FONT_STACK};font-size:22px;line-height:28px;color:${TEXT_PRIMARY}">${escapedTitle}</h1>
            </td>
          </tr>
          ${paragraphsHtml}
          ${codeBlockHtml}
          ${ctaHtml}
          ${footerHtml}
          <tr>
            <td style="height:32px;line-height:32px;font-size:0">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [content.title, '', ...content.paragraphs]
  if (content.codeBlock) textLines.push('', content.codeBlock)
  if (validatedCtaUrl && content.cta) textLines.push('', `${content.cta.label}: ${validatedCtaUrl}`)
  if (content.footerNote) textLines.push('', content.footerNote)

  return { html, text: textLines.join('\n') }
}
