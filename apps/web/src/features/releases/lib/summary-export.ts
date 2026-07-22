import { sanitizeSummaryHtml } from '@/lib/sanitize-summary'

export interface SummaryExportLabels {
  brand: string
  reportTitle: string
  generatedLabel: string
}

export interface ExportSummaryDocumentArgs {
  releaseName: string
  html: string
  generatedAtIso: string
  labels: SummaryExportLabels
}

const PAGE_BG: [number, number, number] = [10, 8, 23]
const RENDER_SCALE = 1.6
const JPEG_QUALITY = 0.85
const PAGE_MARGIN_TOP = 30
const PAGE_MARGIN_BOTTOM = 24
const PAGE_BREAK_SELECTOR = 'header, h2, h3, p, ul, ol, blockquote'

const EXPORT_STYLES = `
  .rh-summary-export {
    position: relative;
    width: 860px;
    padding: 56px 52px 64px;
    background: #0a0817;
    color: #f2f1fa;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow: hidden;
  }
  .rh-summary-export::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 55% at 12% -5%, rgba(99, 102, 241, 0.28) 0%, transparent 60%),
      radial-gradient(48% 48% at 100% 14%, rgba(236, 30, 140, 0.20) 0%, transparent 55%);
  }
  .rh-summary-inner { position: relative; z-index: 1; }
  .rh-summary-export .overline { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #a5b4fc; }
  .rh-summary-export .title {
    font-family: "Space Grotesk", "Inter", sans-serif;
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-top: 10px;
  }
  .rh-summary-export .gen { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: #9d9abf; margin-top: 10px; }
  .rh-summary-export .card {
    background: #16142b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 32px;
    margin-top: 28px;
  }
  .rh-summary-export .card h2 { font-family: "Space Grotesk", "Inter", sans-serif; font-size: 20px; font-weight: 600; margin: 22px 0 8px; }
  .rh-summary-export .card h2:first-child { margin-top: 0; }
  .rh-summary-export .card h3 { font-family: "Space Grotesk", "Inter", sans-serif; font-size: 16px; font-weight: 600; margin: 16px 0 6px; }
  .rh-summary-export .card p { margin: 0 0 12px; color: #d9d7ea; }
  .rh-summary-export .card p:last-child { margin-bottom: 0; }
  .rh-summary-export .card strong { font-weight: 600; color: #f2f1fa; }
  .rh-summary-export .card em { font-style: italic; }
  .rh-summary-export .card ul { list-style: disc; padding-left: 20px; margin: 0 0 12px; color: #d9d7ea; }
  .rh-summary-export .card ol { list-style: decimal; padding-left: 20px; margin: 0 0 12px; color: #d9d7ea; }
  .rh-summary-export .card li { margin-bottom: 4px; }
  .rh-summary-export .card blockquote { border-left: 2px solid rgba(129, 140, 248, 0.6); padding-left: 12px; margin: 12px 0; color: #9d9abf; font-style: italic; }
  .rh-summary-export .card code { background: rgba(255, 255, 255, 0.08); border-radius: 4px; padding: 1px 4px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; }
  .rh-summary-export .card a { color: #a5b4fc; text-decoration: underline; }
  .rh-summary-export .footer { margin-top: 36px; color: #9d9abf; font-size: 12px; text-align: center; }
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'summary'
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildDocumentMarkup(args: ExportSummaryDocumentArgs): string {
  const { releaseName, html, generatedAtIso, labels } = args
  const sanitizedHtml = sanitizeSummaryHtml(html)

  return `<div class="rh-summary-inner">
    <header>
      <div class="overline">${escapeHtml(labels.brand)}</div>
      <h1 class="title">${escapeHtml(releaseName)}</h1>
      <p class="gen">${escapeHtml(labels.generatedLabel)} ${escapeHtml(formatDateTime(generatedAtIso))}</p>
    </header>
    <section class="card">${sanitizedHtml}</section>
    <footer class="footer">${escapeHtml(labels.brand)} · ${escapeHtml(labels.reportTitle)}</footer>
  </div>`
}

export function summaryPdfFilename(releaseName: string): string {
  return `${slug(releaseName)}-summary.pdf`
}

function collectPageBreaks(container: HTMLElement, scale: number): number[] {
  const base = container.getBoundingClientRect().top
  const breaks = new Set<number>([0])
  container.querySelectorAll(PAGE_BREAK_SELECTOR).forEach((element) => {
    const rect = element.getBoundingClientRect()
    breaks.add(Math.round((rect.top - base) * scale))
    breaks.add(Math.round((rect.bottom - base) * scale))
  })
  return Array.from(breaks).sort((a, b) => a - b)
}

function nextPageBreak(breaks: number[], start: number, maxEnd: number, total: number): number {
  if (maxEnd >= total) return total
  let best = -1
  for (const value of breaks) {
    if (value > start + 1 && value <= maxEnd) best = value
  }
  if (best < 0) best = maxEnd
  return Math.min(best, total)
}

export async function exportSummaryDocumentPdf(
  args: ExportSummaryDocumentArgs,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const container = document.createElement('div')
  container.className = 'rh-summary-export'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.innerHTML = `<style>${EXPORT_STYLES}</style>${buildDocumentMarkup(args)}`
  document.body.appendChild(container)

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const canvas = await html2canvas(container, {
      backgroundColor: '#0a0817',
      scale: RENDER_SCALE,
      useCORS: true,
      logging: false,
      windowWidth: container.scrollWidth,
    })

    const breaks = collectPageBreaks(container, RENDER_SCALE)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const usableHeight = pageHeight - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM
    const pageCanvasHeight = Math.floor((canvas.width * usableHeight) / pageWidth)

    let start = 0
    let firstPage = true

    while (start < canvas.height) {
      const end = nextPageBreak(breaks, start, start + pageCanvasHeight, canvas.height)
      const sliceHeight = end - start

      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceHeight
      const ctx = slice.getContext('2d')
      if (!ctx) break
      ctx.fillStyle = '#0a0817'
      ctx.fillRect(0, 0, slice.width, slice.height)
      ctx.drawImage(canvas, 0, start, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

      const imageData = slice.toDataURL('image/jpeg', JPEG_QUALITY)
      const imageHeight = (sliceHeight * pageWidth) / canvas.width

      if (!firstPage) pdf.addPage()
      pdf.setFillColor(...PAGE_BG)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      pdf.addImage(imageData, 'JPEG', 0, PAGE_MARGIN_TOP, pageWidth, imageHeight)

      firstPage = false
      start = end
    }

    pdf.save(filename)
  } finally {
    container.remove()
  }
}
