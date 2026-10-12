export function hasInternalLinks(html: string, appOrigin: string): boolean {
  return html.includes(`href="${appOrigin}/`)
}

export function missingFlagKeys(html: string, flagKeys: string[]): string[] {
  return flagKeys.filter((key) => !html.includes(`/flags/${encodeURIComponent(key)}"`))
}
