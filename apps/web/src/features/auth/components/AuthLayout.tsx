import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { slideUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  eyebrow: string
  headline: string
  supportingText: string
  children: ReactNode
}

export function AuthLayout({ eyebrow, headline, supportingText, children }: AuthLayoutProps) {
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklab,var(--brand-indigo-bright)_28%,transparent),transparent_60%),radial-gradient(circle_at_85%_75%,color-mix(in_oklab,var(--brand-magenta)_22%,transparent),transparent_55%)]"
      />
      <ThemeToggle />

      <div className="relative z-10 grid min-h-svh lg:grid-cols-2">
        <div className="hidden flex-col justify-center gap-8 border-r border-border/40 px-16 lg:flex">
          <m.div
            variants={reduceMotion ? undefined : slideUp}
            initial={reduceMotion ? undefined : 'hidden'}
            animate={reduceMotion ? undefined : 'visible'}
            className="max-w-md space-y-4"
          >
            <p className="text-overline uppercase tracking-widest text-brand-magenta">
              {eyebrow}
            </p>
            <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground text-balance">
              {headline}
            </h1>
            <p className="text-base text-muted-foreground text-balance">{supportingText}</p>
          </m.div>
        </div>

        <div className={cn('flex flex-col items-center justify-center px-6 py-16 md:px-10')}>
          <m.div
            variants={reduceMotion ? undefined : slideUp}
            initial={reduceMotion ? undefined : 'hidden'}
            animate={reduceMotion ? undefined : 'visible'}
            className="w-full max-w-sm"
          >
            {children}
          </m.div>
        </div>
      </div>
    </main>
  )
}
