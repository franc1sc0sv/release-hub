const TITLE_DASH = /(<\/(?:a|strong)>)\s*[—–]\s*/g
const SPACED_DASH = /\s+[—–]\s+/g
const BARE_DASH = /[—–]/g

export function replaceDashes(html: string): string {
  return html.replace(TITLE_DASH, '$1: ').replace(SPACED_DASH, ', ').replace(BARE_DASH, ', ')
}
