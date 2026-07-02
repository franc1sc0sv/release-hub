import type { ReactNode } from 'react'

interface PageHeaderProps {
  overline: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ overline, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-overline uppercase tracking-widest text-muted-foreground">
          {overline}
        </p>
        <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground break-words">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
