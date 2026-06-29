export function htmlToMarkdown(html: string): string {
  if (!html) return ''

  let text = html

  text = text.replace(/<\s*br\s*\/?\s*>/gi, '\n')
  text = text.replace(/<\/\s*(h1|h2|h3|h4|p|li|blockquote|div|ul|ol)\s*>/gi, '\n\n')

  text = text.replace(/<\s*h1[^>]*>/gi, '# ')
  text = text.replace(/<\s*h2[^>]*>/gi, '## ')
  text = text.replace(/<\s*h3[^>]*>/gi, '### ')
  text = text.replace(/<\s*h4[^>]*>/gi, '#### ')
  text = text.replace(/<\s*li[^>]*>/gi, '- ')
  text = text.replace(/<\s*blockquote[^>]*>/gi, '> ')

  text = text.replace(/<\s*(strong|b)[^>]*>/gi, '**').replace(/<\/\s*(strong|b)\s*>/gi, '**')
  text = text.replace(/<\s*(em|i)[^>]*>/gi, '*').replace(/<\/\s*(em|i)\s*>/gi, '*')
  text = text.replace(/<\s*a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/\s*a\s*>/gi, '[$2]($1)')

  text = text.replace(/<[^>]+>/g, '')

  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
}
