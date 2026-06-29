import type { ReactNode } from 'react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'

interface PageFrameProps {
  children: ReactNode
}

export function PageFrame({ children }: PageFrameProps) {
  return (
    <NebulaBackground className="p-6">
      <div className="mx-auto max-w-7xl space-y-8">{children}</div>
    </NebulaBackground>
  )
}
