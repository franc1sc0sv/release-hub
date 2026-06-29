import type { ReactNode } from 'react'

interface PageHeaderProps {
  overline: string
  title: string
  actions?: ReactNode
}

export function PageHeader({ overline, title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-overline uppercase tracking-widest text-muted-foreground">
          {overline}
        </p>
        <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
