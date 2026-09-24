import type { ReactNode } from 'react'

interface ReleaseSectionHeadingProps {
  id: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function ReleaseSectionHeading({ id, title, description, actions }: ReleaseSectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <h2 id={id} className="font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
