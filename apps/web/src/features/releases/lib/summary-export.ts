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
const EXPORT_CONTAINER_CLASS = 'rh-summary-export'
const LINK_HIT_PADDING = 6

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
  .rh-summary-export .card ul, .rh-summary-export .card ol { list-style: none; padding-left: 0; margin: 0 0 12px; color: #d9d7ea; }
  .rh-summary-export .card li { position: relative; padding-left: 24px; margin-bottom: 14px; }
  .rh-summary-export .card li:last-child { margin-bottom: 0; }
  .rh-summary-export .card li p { margin: 0; }
  .rh-summary-export .card li p + p { margin-top: 8px; }
  .rh-summary-export .card ul > li::before { content: ""; position: absolute; left: 7px; top: 16px; width: 6px; height: 6px; border-radius: 9999px; background: #a5b4fc; }
  .rh-summary-export .card ol > li { counter-increment: rh-item; }
  .rh-summary-export .card ol > li::before { content: counter(rh-item) "."; position: absolute; left: 0; top: 0; font-weight: 600; color: #a5b4fc; }
  .rh-summary-export .card li.rh-continued { counter-increment: none; }
  .rh-summary-export .card li.rh-continued::before { content: none; }
  .rh-summary-export .card li ul, .rh-summary-export .card li ol { margin: 10px 0 0; }
  .rh-summary-export .card li li { margin-bottom: 10px; }
  .rh-summary-export .card blockquote { border-left: 2px solid rgba(129, 140, 248, 0.6); padding-left: 12px; margin: 12px 0; color: #9d9abf; font-style: italic; }
  .rh-summary-export .card code { display: inline-block; background: rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 2px 6px; margin: 2px 0; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; line-height: 16px; vertical-align: middle; }
  .rh-summary-export .card a { color: #a5b4fc; text-decoration: underline; }
  .rh-summary-export .card a strong { color: #a5b4fc; }
  .rh-summary-export .card a code { color: #c7d2fe; }
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

export interface ISummaryClipboard {
  html: string
  text: string
}

const LIST_TAGS = new Set(['UL', 'OL'])

function blockToText(element: Element): string {
  if (!LIST_TAGS.has(element.tagName)) return element.textContent?.trim() ?? ''
  const ordered = element.tagName === 'OL'
  return Array.from(element.children)
    .map((item, index) => `${ordered ? `${index + 1}.` : '•'} ${item.textContent?.trim() ?? ''}`)
    .join('\n')
}

export function buildSummaryClipboard(releaseName: string, html: string): ISummaryClipboard {
  const body = new DOMParser().parseFromString(sanitizeSummaryHtml(html), 'text/html').body
  body.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'))

  const blocks = Array.from(body.children).map(blockToText).filter((block) => block.length > 0)

  return {
    html: `<h1>${escapeHtml(releaseName)}</h1>${body.innerHTML}`,
    text: [releaseName, ...blocks].join('\n\n'),
  }
}

export function reportPdfFilename(releaseName: string, suffix: string): string {
  return `${slug(releaseName)}-${suffix}.pdf`
}

export function summaryPdfFilename(releaseName: string): string {
  return reportPdfFilename(releaseName, 'summary')
}

interface IBlockWrapper {
  key: string
  tag: string
  open: string
  reopen: string
}

interface IPageBlock {
  html: string
  height: number
  wrappers: IBlockWrapper[]
  keepWithNext: boolean
}

interface IPageContent {
  header: string | null
  blocks: IPageBlock[]
  footer: string | null
}

interface IPageLink {
  left: number
  top: number
  width: number
  height: number
  url: string
}

interface IRenderedPage {
  canvas: HTMLCanvasElement
  layoutWidth: number
  links: IPageLink[]
}

function verticalMargins(element: Element): number {
  const style = getComputedStyle(element)
  return parseFloat(style.marginTop) + parseFloat(style.marginBottom)
}

function verticalChrome(element: Element): number {
  const style = getComputedStyle(element)
  return (
    parseFloat(style.paddingTop) +
    parseFloat(style.paddingBottom) +
    parseFloat(style.borderTopWidth) +
    parseFloat(style.borderBottomWidth)
  )
}

function outerHeight(element: Element): number {
  return element.getBoundingClientRect().height + verticalMargins(element)
}

const HEADING_TAGS = new Set(['H2', 'H3'])
const CONTINUED_ITEM_CLASS = 'rh-continued'

function listWrapper(list: Element, key: string, index: number): IBlockWrapper {
  const tag = list.tagName.toLowerCase()
  const open = tag === 'ol' ? `<ol style="counter-reset: rh-item ${index}">` : `<${tag}>`
  return { key, tag, open, reopen: open }
}

function serializeNodes(nodes: ChildNode[]): string {
  const holder = document.createElement('div')
  nodes.forEach((node) => holder.appendChild(node.cloneNode(true)))
  return holder.innerHTML
}

function collectListBlocks(list: Element, parents: IBlockWrapper[], nextKey: () => string): IPageBlock[] {
  const listKey = nextKey()
  const listMargins = verticalMargins(list)
  return Array.from(list.children).flatMap((item, index): IPageBlock[] => {
    const wrappers = [...parents, listWrapper(list, listKey, index)]
    const leadingMargin = index === 0 ? listMargins : 0
    const nested = Array.from(item.children).find((child) => LIST_TAGS.has(child.tagName))
    if (!nested) {
      return [{ html: item.outerHTML, height: outerHeight(item) + leadingMargin, wrappers, keepWithNext: false }]
    }

    const nodes = Array.from(item.childNodes)
    const nestedIndex = nodes.indexOf(nested)
    const itemRect = item.getBoundingClientRect()
    const nestedRect = nested.getBoundingClientRect()
    const itemWrapper: IBlockWrapper = {
      key: nextKey(),
      tag: 'li',
      open: '<li>',
      reopen: `<li class="${CONTINUED_ITEM_CLASS}">`,
    }
    const itemWrappers = [...wrappers, itemWrapper]
    const trailing = serializeNodes(nodes.slice(nestedIndex + 1)).trim()

    return [
      {
        html: serializeNodes(nodes.slice(0, nestedIndex)),
        height: nestedRect.top - itemRect.top + leadingMargin,
        wrappers: itemWrappers,
        keepWithNext: true,
      },
      ...collectListBlocks(nested, itemWrappers, nextKey),
      ...(trailing
        ? [{ html: trailing, height: itemRect.bottom - nestedRect.bottom, wrappers: itemWrappers, keepWithNext: false }]
        : []),
    ]
  })
}

function collectCardBlocks(card: Element): IPageBlock[] {
  let counter = 0
  const nextKey = () => `wrapper-${counter++}`
  return Array.from(card.children).flatMap((child): IPageBlock[] =>
    LIST_TAGS.has(child.tagName)
      ? collectListBlocks(child, [], nextKey)
      : [{ html: child.outerHTML, height: outerHeight(child), wrappers: [], keepWithNext: HEADING_TAGS.has(child.tagName) }],
  )
}

function heightKeptTogether(blocks: IPageBlock[], index: number): number {
  let height = 0
  let cursor = index
  while (cursor < blocks.length) {
    height += blocks[cursor].height
    if (!blocks[cursor].keepWithNext) break
    cursor += 1
  }
  return height
}

function paginate(container: HTMLElement, pageCapacity: number): IPageContent[] {
  const header = container.querySelector('header')
  const card = container.querySelector('.card')
  const footer = container.querySelector('footer')
  const cardChrome = card ? verticalChrome(card) + verticalMargins(card) : 0
  const blocks = card ? collectCardBlocks(card) : []

  const pages: IPageContent[] = []
  let current: IPageContent = { header: header?.outerHTML ?? null, blocks: [], footer: null }
  let used = (header ? outerHeight(header) : 0) + cardChrome

  blocks.forEach((block, index) => {
    if (current.blocks.length > 0 && used + heightKeptTogether(blocks, index) > pageCapacity) {
      pages.push(current)
      current = { header: null, blocks: [], footer: null }
      used = cardChrome
    }
    current.blocks.push(block)
    used += block.height
  })

  if (footer) {
    if (used + outerHeight(footer) > pageCapacity) {
      pages.push(current)
      current = { header: null, blocks: [], footer: null }
    }
    current.footer = footer.outerHTML
  }
  pages.push(current)
  return pages
}

function commonWrapperDepth(open: IBlockWrapper[], next: IBlockWrapper[]): number {
  let depth = 0
  while (depth < open.length && depth < next.length && open[depth].key === next[depth].key) depth += 1
  return depth
}

function buildCardMarkup(blocks: IPageBlock[], openedKeys: Set<string>): string {
  let markup = ''
  let open: IBlockWrapper[] = []
  for (const block of blocks) {
    const depth = commonWrapperDepth(open, block.wrappers)
    markup += open.slice(depth).reverse().map((wrapper) => `</${wrapper.tag}>`).join('')
    for (const wrapper of block.wrappers.slice(depth)) {
      markup += openedKeys.has(wrapper.key) ? wrapper.reopen : wrapper.open
      openedKeys.add(wrapper.key)
    }
    open = block.wrappers
    markup += block.html
  }
  markup += open.slice().reverse().map((wrapper) => `</${wrapper.tag}>`).join('')
  return markup
}

function buildPageMarkup(page: IPageContent, openedKeys: Set<string>): string {
  const card = page.blocks.length > 0 ? `<section class="card">${buildCardMarkup(page.blocks, openedKeys)}</section>` : ''
  return `<div class="rh-summary-inner">${page.header ?? ''}${card}${page.footer ?? ''}</div>`
}

function createExportContainer(markup: string): HTMLDivElement {
  const container = document.createElement('div')
  container.className = EXPORT_CONTAINER_CLASS
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.innerHTML = `<style>${EXPORT_STYLES}</style>${markup}`
  document.body.appendChild(container)
  return container
}

function collectLinks(container: Element): IPageLink[] {
  const base = container.getBoundingClientRect()
  return Array.from(container.querySelectorAll('a[href]')).flatMap((anchor) =>
    Array.from(anchor.getClientRects()).map((rect) => ({
      left: rect.left - base.left - LINK_HIT_PADDING,
      top: rect.top - base.top - LINK_HIT_PADDING,
      width: rect.width + LINK_HIT_PADDING * 2,
      height: rect.height + LINK_HIT_PADDING * 2,
      url: anchor.getAttribute('href') ?? '',
    })),
  )
}

type Html2Canvas = (typeof import('html2canvas'))['default']

async function renderPage(
  html2canvas: Html2Canvas,
  page: IPageContent,
  openedKeys: Set<string>,
): Promise<IRenderedPage> {
  const container = createExportContainer(buildPageMarkup(page, openedKeys))
  let layoutWidth = container.getBoundingClientRect().width
  let links = collectLinks(container)
  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#0a0817',
      scale: RENDER_SCALE,
      useCORS: true,
      logging: false,
      windowWidth: container.scrollWidth,
      onclone: (clonedDocument) => {
        const clone = clonedDocument.querySelector(`.${EXPORT_CONTAINER_CLASS}`)
        if (!clone) return
        layoutWidth = clone.getBoundingClientRect().width
        links = collectLinks(clone)
      },
    })
    return { canvas, layoutWidth, links }
  } finally {
    container.remove()
  }
}

export async function exportSummaryDocumentPdf(
  args: ExportSummaryDocumentArgs,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const usableHeight = pageHeight - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM

  const measure = createExportContainer(buildDocumentMarkup(args))
  let pages: IPageContent[]
  try {
    const pageHeightPx = (measure.getBoundingClientRect().width * usableHeight) / pageWidth
    pages = paginate(measure, pageHeightPx - verticalChrome(measure))
  } finally {
    measure.remove()
  }

  const openedKeys = new Set<string>()
  for (const [index, page] of pages.entries()) {
    const rendered = await renderPage(html2canvas, page, openedKeys)
    const naturalHeight = (rendered.canvas.height * pageWidth) / rendered.canvas.width
    const fit = Math.min(1, usableHeight / naturalHeight)
    const imageWidth = pageWidth * fit
    const left = (pageWidth - imageWidth) / 2
    const pointsPerPixel = imageWidth / rendered.layoutWidth

    if (index > 0) pdf.addPage()
    pdf.setFillColor(...PAGE_BG)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    pdf.addImage(
      rendered.canvas.toDataURL('image/jpeg', JPEG_QUALITY),
      'JPEG',
      left,
      PAGE_MARGIN_TOP,
      imageWidth,
      naturalHeight * fit,
    )
    for (const link of rendered.links) {
      pdf.link(
        left + link.left * pointsPerPixel,
        PAGE_MARGIN_TOP + link.top * pointsPerPixel,
        link.width * pointsPerPixel,
        link.height * pointsPerPixel,
        { url: link.url },
      )
    }
  }

  pdf.save(filename)
}
