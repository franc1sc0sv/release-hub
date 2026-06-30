import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { FlagComparisonRowType } from '@/generated/graphql'

export interface FlagComparisonExportLabels {
  brand: string
  reportTitle: string
  baselineLabel: string
  comparedLabel: string
  generatedLabel: string
  totalLabel: string
  onInBaselineLabel: string
  offInBaselineLabel: string
  onInBaselineHeading: string
  offInBaselineHeading: string
  inSync: string
  footer: string
}

export interface ExportFlagComparisonArgs {
  projectName: string
  baselineEnvironment: string
  comparedEnvironments: string[]
  rows: FlagComparisonRowType[]
  generatedAtIso: string
  labels: FlagComparisonExportLabels
}

const PAGE_BG: [number, number, number] = [10, 8, 23]
const RENDER_SCALE = 1.6
const JPEG_QUALITY = 0.82
const PAGE_MARGIN_TOP = 30
const PAGE_MARGIN_BOTTOM = 24

const EXPORT_STYLES = `
  .rh-export {
    position: relative;
    width: 920px;
    padding: 56px 48px 64px;
    background: #0a0817;
    color: #f2f1fa;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    overflow: hidden;
  }
  .rh-export::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 55% at 12% -5%, rgba(99, 102, 241, 0.28) 0%, transparent 60%),
      radial-gradient(48% 48% at 100% 14%, rgba(236, 30, 140, 0.20) 0%, transparent 55%),
      radial-gradient(45% 45% at 82% 102%, rgba(139, 92, 246, 0.18) 0%, transparent 60%);
  }
  .rh-inner { position: relative; z-index: 1; }
  .rh-export .grad { color: #a5b4fc; }
  .rh-export .overline { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
  .rh-export .title {
    font-family: "Space Grotesk", "Inter", sans-serif;
    font-size: 46px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin-top: 10px;
  }
  .rh-export .lede { color: #9d9abf; font-size: 16px; margin-top: 12px; }
  .rh-export .badges { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 22px; }
  .rh-export .env-pill {
    position: relative;
    display: inline-block;
    border: 1px solid rgba(129, 140, 248, 0.35);
    background: rgba(99, 102, 241, 0.12);
    color: #c7d2fe;
    border-radius: 999px;
    padding: 6px 15px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
  }
  .rh-export .env-pill.with-dot { padding-left: 30px; }
  .rh-export .env-pill .dot { position: absolute; left: 14px; top: 8px; }
  .rh-export .gen { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 13px; color: #9d9abf; }
  .rh-export .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
  .rh-export .stat {
    background: #16142b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 22px 20px;
  }
  .rh-export .num { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 34px; font-weight: 600; line-height: 1; }
  .rh-export .num.indigo { color: #818cf8; }
  .rh-export .num.green { color: #4ade80; }
  .rh-export .num.white { color: #f2f1fa; }
  .rh-export .stat .label { margin-top: 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #9d9abf; }
  .rh-export .card {
    background: #16142b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 26px;
    margin-top: 22px;
  }
  .rh-export .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .rh-export .section-head h2 { font-family: "Space Grotesk", "Inter", sans-serif; font-size: 19px; font-weight: 600; }
  .rh-export .count-pill {
    margin-left: auto;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 13px;
    color: #9d9abf;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    padding: 4px 12px;
  }
  .rh-export .dot { width: 9px; height: 9px; border-radius: 999px; box-sizing: border-box; }
  .rh-export .dot.on { background: #4ade80; }
  .rh-export .dot.off { background: transparent; border: 1.5px solid #6b6890; }
  .rh-export .flags { display: flex; flex-direction: column; gap: 8px; }
  .rh-export .flag {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
  }
  .rh-export .flag .key { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 13.5px; font-weight: 500; flex: 1; word-break: break-all; }
  .rh-export .empty { color: #9d9abf; font-size: 14px; }
  .rh-export .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
  .rh-export .chip {
    position: relative;
    display: inline-block;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 6px 28px 6px 12px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 12px;
    line-height: 1;
  }
  .rh-export .chip .dot { position: absolute; right: 12px; top: 7.5px; }
  .rh-export .footer { margin-top: 44px; color: #9d9abf; font-size: 12px; text-align: center; }
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
      .replace(/^-+|-+$/g, '') || 'flags'
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

function renderGroup(heading: string, rows: FlagComparisonRowType[]): string {
  if (rows.length === 0) return ''
  const list = rows
    .map((row) => {
      const chips = row.divergences
        .map(
          (divergence) =>
            `<span class="chip">${escapeHtml(divergence.name)}<span class="dot ${
              divergence.enabled ? 'on' : 'off'
            }"></span></span>`,
        )
        .join('')
      return `<div class="flag"><span class="key">${escapeHtml(row.key)}</span><div class="chips">${chips}</div></div>`
    })
    .join('')
  return `<section class="card"><div class="section-head"><h2>${escapeHtml(heading)}</h2><span class="count-pill">${rows.length}</span></div><div class="flags">${list}</div></section>`
}

function buildComparisonMarkup(args: ExportFlagComparisonArgs): string {
  const { projectName, baselineEnvironment, comparedEnvironments, rows, generatedAtIso, labels } =
    args

  const onInBaseline = rows.filter((row) => row.baselineEnabled === true)
  const offInBaseline = rows.filter((row) => row.baselineEnabled === false)

  const stats = `<div class="stats">
    <div class="stat"><div class="num indigo">${rows.length}</div><div class="label">${escapeHtml(labels.totalLabel)}</div></div>
    <div class="stat"><div class="num green">${onInBaseline.length}</div><div class="label">${escapeHtml(labels.onInBaselineLabel)}</div></div>
    <div class="stat"><div class="num white">${offInBaseline.length}</div><div class="label">${escapeHtml(labels.offInBaselineLabel)}</div></div>
  </div>`

  const sections = rows.length
    ? `${renderGroup(labels.onInBaselineHeading, onInBaseline)}${renderGroup(labels.offInBaselineHeading, offInBaseline)}`
    : `<section class="card"><p class="empty">${escapeHtml(labels.inSync)}</p></section>`

  const comparedPills = comparedEnvironments
    .map((env) => `<span class="env-pill">${escapeHtml(env)}</span>`)
    .join('')

  return `<div class="rh-inner">
    <header>
      <div class="overline grad">${escapeHtml(labels.brand)}</div>
      <h1 class="title">${escapeHtml(projectName)}</h1>
      <p class="lede">${escapeHtml(labels.reportTitle)}</p>
      <div class="badges">
        <span class="env-pill with-dot"><span class="dot on"></span>${escapeHtml(labels.baselineLabel)} · ${escapeHtml(baselineEnvironment)}</span>
        <span class="gen">${escapeHtml(labels.comparedLabel)}:</span>
        ${comparedPills}
        <span class="gen">${escapeHtml(labels.generatedLabel)} ${escapeHtml(formatDateTime(generatedAtIso))}</span>
      </div>
    </header>
    ${stats}
    ${sections}
    <footer class="footer"><span class="grad">${escapeHtml(labels.brand)}</span> · ${escapeHtml(labels.footer)}</footer>
  </div>`
}

export function flagComparisonPdfFilename(projectName: string, baselineEnvironment: string): string {
  return `${slug(projectName)}-${slug(baselineEnvironment)}-comparison.pdf`
}

function collectPageBreaks(container: HTMLElement, scale: number): number[] {
  const base = container.getBoundingClientRect().top
  const breaks = new Set<number>([0])
  container.querySelectorAll('header, .stats, .card, .flag, .footer').forEach((element) => {
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

export async function exportFlagComparisonPdf(
  args: ExportFlagComparisonArgs,
  filename: string,
): Promise<void> {
  const container = document.createElement('div')
  container.className = 'rh-export'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.innerHTML = `<style>${EXPORT_STYLES}</style>${buildComparisonMarkup(args)}`
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
