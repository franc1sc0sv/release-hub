import { ExternalLink } from 'lucide-react'

interface FlagPrLinkChipProps {
  prNumber: number
  prTitle: string
  prUrl: string
}

export function FlagPrLinkChip({ prNumber, prTitle, prUrl }: FlagPrLinkChipProps) {
  return (
    <a
      href={prUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={prTitle}
      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="font-mono">#{prNumber}</span>
      <ExternalLink className="size-3" aria-hidden />
    </a>
  )
}
