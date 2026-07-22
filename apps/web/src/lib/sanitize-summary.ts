import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'h2',
  'h3',
  'p',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'code',
  'blockquote',
  'a',
  'span',
]

const ALLOWED_ATTR = ['href', 'style']

function restrictStyleToColor(node: Element): void {
  const style = node.getAttribute('style')
  if (!style) return

  const colorMatch = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)
  if (node.tagName.toLowerCase() !== 'span' || !colorMatch) {
    node.removeAttribute('style')
    return
  }

  node.setAttribute('style', `color:${colorMatch[1].trim()}`)
}

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') {
    restrictStyleToColor(node)
    data.keepAttr = false
  }
})

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName.toLowerCase() === 'a') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function sanitizeSummaryHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
    ALLOW_DATA_ATTR: false,
  })
}
