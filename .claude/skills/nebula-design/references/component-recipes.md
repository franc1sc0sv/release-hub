# Nebula — Component Recipes

Copy-paste compositions for the recurring Nebula patterns. All recipes:
- compose the **already-installed shadcn primitives** (never rebuild them),
- are **comment-free**, **fully typed**, **named exports** (pages are the only
  default exports),
- import `cn` from `@/lib/utils`, primitives from `@/components/ui/*`, motion from
  `motion/react`,
- contain **no hardcoded user-facing text** — text comes in via props/children so
  the caller wires `useTranslation`.

Place shared Nebula components in `apps/web/src/components/nebula/`.

---

## 1. NebulaBackground — the canvas

The void + aurora wrapper. Wrap every Nebula screen in this.

`apps/web/src/components/nebula/NebulaBackground.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NebulaBackgroundProps {
  children: ReactNode
  className?: string
}

export function NebulaBackground({ children, className }: NebulaBackgroundProps) {
  return (
    <div className={cn('relative min-h-full overflow-hidden bg-background', className)}>
      <div className="bg-nebula-aurora pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent,var(--background)_70%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

---

## 2. GlassCard — the default surface

A glass slab. Use instead of a bare shadcn `Card` when you want the Nebula depth.
Still composes `Card` so all shadcn card subparts work.

`apps/web/src/components/nebula/GlassCard.tsx`

```tsx
import type { ComponentProps } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GlassCardProps extends ComponentProps<typeof Card> {
  glow?: 'none' | 'indigo' | 'magenta'
}

const glowMap: Record<NonNullable<GlassCardProps['glow']>, string> = {
  none: '',
  indigo: 'shadow-glow-indigo',
  magenta: 'shadow-glow-magenta',
}

export function GlassCard({ glow = 'none', className, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass rounded-3xl border-border/60',
        'transition-shadow duration-300',
        glowMap[glow],
        className,
      )}
      {...props}
    />
  )
}
```

---

## 3. GradientButton — the one CTA per view

The signature action. Built on shadcn `Button` (keeps a11y, sizing, asChild). Use
**once** per view for the primary action; everything else uses standard `Button`
variants.

`apps/web/src/components/nebula/GradientButton.tsx`

```tsx
import type { ComponentProps } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type GradientButtonProps = ComponentProps<typeof Button>

export function GradientButton({ className, children, ...props }: GradientButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="inline-block"
    >
      <Button
        className={cn(
          'bg-nebula-gradient rounded-full border-0 px-6 font-medium text-white',
          'shadow-glow-indigo transition-shadow duration-300 hover:shadow-glow-lg',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
```

Usage (caller supplies text + the arrow motif):

```tsx
<GradientButton onClick={onStart}>
  {t('cta.getStarted')}
  <ArrowUpRight className="size-4" />
</GradientButton>
```

---

## 4. Floating pill nav item

Turns shadcn sidebar/nav buttons into Nebula pills with a gradient active state.
For the existing `AppShell` sidebar, style `SidebarMenuButton` with this pattern;
for a top floating nav, wrap a row of these in a `glass rounded-full` bar.

```tsx
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavPillProps {
  to: string
  icon: ReactNode
  label: string
}

export function NavPill({ to, icon, label }: NavPillProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-nebula-gradient text-white shadow-glow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
```

Floating bar shell:

```tsx
<nav className="glass mx-auto flex w-fit items-center gap-1 rounded-full p-1.5">
  {items.map((item) => (
    <NavPill key={item.to} to={item.to} icon={item.icon} label={item.label} />
  ))}
</nav>
```

---

## 5. StatCard — glanceable metric tile

Glass tile, eyebrow label, oversized mono value, trend chip, and a recharts
sparkline with a gradient fill. The key metric on a screen gets `glow="magenta"`;
the rest `glow="indigo"` or none.

`apps/web/src/components/nebula/StatCard.tsx`

```tsx
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  trendLabel: string
  trendDirection: 'up' | 'down'
  series: ReadonlyArray<{ value: number }>
  glow?: 'none' | 'indigo' | 'magenta'
}

export function StatCard({
  label,
  value,
  trendLabel,
  trendDirection,
  series,
  glow = 'indigo',
}: StatCardProps) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown

  return (
    <GlassCard glow={glow}>
      <CardContent className="flex flex-col gap-4 p-6">
        <span className="text-overline uppercase text-muted-foreground">{label}</span>
        <div className="flex items-end justify-between gap-4">
          <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              trendDirection === 'up'
                ? 'bg-chart-4/15 text-chart-4'
                : 'bg-destructive/15 text-destructive',
            )}
          >
            <TrendIcon className="size-3.5" />
            {trendLabel}
          </span>
        </div>
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...series]} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="nebula-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-indigo-bright)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--brand-magenta)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--brand-indigo-bright)"
                strokeWidth={2}
                fill="url(#nebula-spark)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </GlassCard>
  )
}
```

---

## 6. Expressive-but-legible data table

Glass frame, glowing header, pill status badges, row hover glow — **calm cells**.
Compose shadcn `Table`. Numbers in `font-mono`. Status from a real enum, never a
string literal.

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge } from '@/components/nebula/StatusBadge'

export function NebulaTable<TRow extends { id: string }>({ rows, columns, renderRow }: NebulaTableProps<TRow>) {
  return (
    <GlassCard className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col} className="text-overline uppercase text-muted-foreground">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-border/40 transition-colors hover:bg-accent/40"
            >
              {renderRow(row)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassCard>
  )
}
```

Rule for cells: `<TableCell className="font-mono tabular-nums">` for numbers,
plain `<TableCell>` for text, `<StatusBadge status={row.status} />` for status.
Keep cells undecorated — the *frame* carries the vibe.

---

## 7. StatusBadge — pill states keyed off an enum

Shadcn `Badge` as a pill. The variant map is keyed by the **domain enum** (import
from `@release-hub/shared` or generated GraphQL types) — no magic strings, and the
icon makes the state legible without relying on color alone.

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ReleaseStatus
  label: string
}

const statusStyles: Record<ReleaseStatus, string> = {
  [ReleaseStatus.Draft]: 'bg-muted text-muted-foreground',
  [ReleaseStatus.Scheduled]: 'bg-chart-4/15 text-chart-4',
  [ReleaseStatus.Published]: 'bg-brand-indigo-bright/15 text-brand-indigo-bright',
  [ReleaseStatus.Failed]: 'bg-destructive/15 text-destructive',
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge className={cn('rounded-full border-0 font-medium', statusStyles[status])}>
      {label}
    </Badge>
  )
}
```

(`ReleaseStatus` is illustrative — use the actual enum the feature owns. Caller
passes `label={t(...)}`.)

---

## 8. SectionHeading — eyebrow + display headline

The rhythm setter for any section. Eyebrow (often magenta), then a `text-display-*`
headline, optional supporting line.

`apps/web/src/components/nebula/SectionHeading.tsx`

```tsx
interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {eyebrow ? (
        <span className="text-overline uppercase text-brand-magenta">{eyebrow}</span>
      ) : null}
      <h1 className="font-display text-display-lg text-foreground">{title}</h1>
      {description ? (
        <p className="text-base text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
```

For a hero with a gradient word, wrap the emphasized span in `text-nebula-gradient`:

```tsx
<h1 className="font-display text-display-2xl text-foreground">
  {t('hero.lead')} <span className="text-nebula-gradient">{t('hero.accent')}</span>
</h1>
```

---

## 9. Pill input + gradient focus glow

Compose shadcn `Input` / `Field`. Pill shape, indigo focus glow. For the "register
your store" style inline-CTA input (etail), pair a pill input with a circular
`GradientButton`.

```tsx
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PillInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        'h-12 rounded-full border-border/60 bg-input/60 px-5',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:shadow-glow-sm',
        className,
      )}
      {...props}
    />
  )
}
```

Inline-CTA composition (icon · input · circular gradient submit):

```tsx
<form className="glass flex items-center gap-2 rounded-full p-2" onSubmit={onSubmit}>
  <Store className="ml-3 size-5 text-brand-magenta" />
  <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder={t('field.storeName')} />
  <GradientButton type="submit" size="icon" className="size-10 shrink-0 rounded-full p-0">
    <ArrowRight className="size-5" />
  </GradientButton>
</form>
```

---

## Composition rules of thumb

- **shadcn first, always.** Need something new (command palette, etc.)? Install it
  (`pnpm dlx shadcn@latest add command`) — don't hand-roll.
- **Pills for controls, glass slabs for containers.** No in-between radii.
- **One `bg-nebula-gradient` action per view.** One `glow="magenta"` element per
  view. Discipline is the whole aesthetic.
- **Numbers in `font-mono tabular-nums`.** Calms dense data inside the loud shell.
- **Text comes from the caller via props/children.** Shared components stay
  i18n-agnostic; pages own the `useTranslation` namespace.
