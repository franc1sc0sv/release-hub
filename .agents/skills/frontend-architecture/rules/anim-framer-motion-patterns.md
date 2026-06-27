---
title: Use Framer Motion for All Transitions and Micro-interactions
impact: HIGH
tags: animation, framer-motion, ux, transitions
---

## Use Framer Motion for All Transitions and Micro-interactions

Every interactive element should feel alive. Use `motion` from `framer-motion` for page transitions, component enter/exit, hover states, layout animations, and loading skeletons.

### Page Transitions

Wrap page content in a shared animation wrapper for consistent enter/exit:

```typescript
// @/components/shell/page-transition.tsx
import { motion } from 'motion/react'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

Use in every page component:

```typescript
// features/widgets/pages/widgets-page.tsx
import { PageTransition } from '@/components/shell/page-transition'

export default function WidgetsPage() {
  const { widgets, loading, error } = useWidgets()
  if (loading) return <PageLoader />
  if (error) return <ErrorState error={error} />

  return (
    <PageTransition>
      <WidgetList widgets={widgets} />
    </PageTransition>
  )
}
```

### AnimatePresence for Route Transitions

Wrap the router outlet with `AnimatePresence` for exit animations:

```typescript
// layouts/app-layout.tsx
import { AnimatePresence } from 'motion/react'
import { useLocation, Outlet } from 'react-router-dom'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
    </div>
  )
}
```

### Staggered List Animations

Cards and list items should stagger in:

```typescript
// features/widgets/components/widget-list.tsx
import { motion } from 'motion/react'
import type { Widget } from '@release-hub/shared'

const container = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export function WidgetList({ widgets }: { widgets: Widget[] }) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="initial"
      animate="animate"
    >
      {widgets.map((widget) => (
        <motion.div key={widget.id} variants={item}>
          <WidgetCard widget={widget} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Hover and Tap Micro-interactions

Interactive cards should respond to interaction:

```typescript
// features/items/components/item-card.tsx
import { motion } from 'motion/react'

export function ItemCard({ item }: { item: Item }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent>{item.summary}</CardContent>
      </Card>
    </motion.div>
  )
}
```

### Layout Animations

Use `layout` prop for smooth reflows when content changes (filters, tabs, reorder):

```typescript
// features/widgets/components/widget-card.tsx
import { motion } from 'motion/react'

export function WidgetCard({ widget }: { widget: Widget }) {
  return (
    <motion.div layout layoutId={`widget-${widget.id}`}>
      <Card>
        <CardContent>{widget.name}</CardContent>
      </Card>
    </motion.div>
  )
}
```

### Conditional Elements (Expand/Collapse, Modals)

Wrap conditional renders with `AnimatePresence`:

```typescript
// features/widgets/components/widget-item-list.tsx
import { motion, AnimatePresence } from 'motion/react'

export function WidgetItemList({ items, expanded }: Props) {
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {items.map((i) => (
            <WidgetItemRow key={i.id} item={i} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### Shared Animation Presets

Define reusable animation presets in `lib/animations.ts`:

```typescript
// lib/animations.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
}

export const slideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' },
}

export const stagger = (delay = 0.05) => ({
  animate: { transition: { staggerChildren: delay } },
})

export const springTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
}
```

### Where to Animate

| Element | Animation | Pattern |
|---------|-----------|---------|
| Page enter/exit | Fade + slide up | `PageTransition` wrapper |
| Card lists | Staggered fade in | `container` + `item` variants |
| Interactive cards | Hover scale + shadow, tap press | `whileHover` + `whileTap` |
| Modals/dialogs | Fade + scale from 0.95 | `AnimatePresence` + motion.div |
| Sidebar collapse | Width + opacity | `animate` with layout |
| Tab content switch | Fade crossfade | `AnimatePresence mode="wait"` |
| Loading → content | Fade out skeleton, fade in content | `AnimatePresence mode="wait"` |
| Expand/collapse | Height auto + opacity | `AnimatePresence` + overflow-hidden |
| Toast notifications | Slide in from edge | `initial/animate/exit` with x or y |
| Stat counters (dashboard) | Count up number | `motion.span` with `useMotionValue` |
| Favorites toggle | Pop spring | `whileTap={{ scale: 1.3 }}` |

### Performance Rules

- **Never animate `width`/`height` directly** — use `scale` or `layout` prop instead
- **Use `will-change: transform`** via Tailwind's `will-change-transform` on heavy animations
- **Respect reduced motion** — wrap animations with a check:

```typescript
import { useReducedMotion } from 'motion/react'

export function useAnimationConfig() {
  const shouldReduce = useReducedMotion()
  return shouldReduce
    ? { initial: false, animate: {}, exit: {}, transition: { duration: 0 } }
    : undefined // use default animations
}
```

**Why it matters:**
- Animations make the app feel polished and professional
- Staggered lists guide the eye and improve perceived performance
- Micro-interactions provide feedback that the UI is responsive
- Consistent animation language creates a cohesive experience
