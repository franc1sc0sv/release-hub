# Nebula — Motion & 3D

Two layers of life: **Framer Motion** for UI choreography (everywhere) and
**Spline / React Three Fiber** for the tactile 3D focal object (one per hero
moment). Both respect `prefers-reduced-motion` as a hard requirement.

`motion` (Framer v12) is already installed. Import from `motion/react`.

---

## 1. Animation presets — `apps/web/src/lib/animations.ts`

One source of truth for motion. Tune here, not in components.

```ts
import type { Variants, Transition } from 'motion/react'

export const easeSoft: Transition['ease'] = [0.22, 1, 0.36, 1]

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeSoft } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeSoft } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeSoft } },
}

export const springTap = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
} as const

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
  },
}
```

### Usage patterns

**Staggered entrance** (the default for any list/grid of cards):

```tsx
import { motion } from 'motion/react'
import { slideUp, staggerContainer } from '@/lib/animations'

<motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-3">
  {items.map((item) => (
    <motion.div key={item.id} variants={slideUp}>
      <StatCard {...item} />
    </motion.div>
  ))}
</motion.div>
```

**Scroll reveal** — swap `animate="visible"` for
`whileInView="visible" viewport={{ once: true, margin: '-80px' }}`.

**Reduced motion** — gate any non-trivial animation:

```tsx
import { useReducedMotion } from 'motion/react'

const reduceMotion = useReducedMotion()
const variants = reduceMotion ? undefined : slideUp
```

When `reduceMotion` is true: drop entrance variants (render final state), stop
floats, and render 3D as a static poster (below).

---

## 2. Spline scene — the high-fidelity hero object

Best for designer-authored glassy/clay scenes (the reference look). One per hero
moment. Always lazy-loaded, poster fallback, reduced-motion safe.

**Install (one-time):**
```
pnpm --filter @release-hub/web add @splinetool/react-spline @splinetool/runtime
```

`apps/web/src/components/nebula/Scene3D.tsx`

```tsx
import { Suspense, lazy } from 'react'
import { useReducedMotion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface Scene3DProps {
  sceneUrl: string
  posterSrc: string
  posterAlt: string
  className?: string
}

export function Scene3D({ sceneUrl, posterSrc, posterAlt, className }: Scene3DProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <img src={posterSrc} alt={posterAlt} className={cn('h-full w-full object-contain', className)} />
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <Suspense fallback={<Skeleton className="size-full rounded-3xl" />}>
        <Spline scene={sceneUrl} />
      </Suspense>
    </div>
  )
}
```

Notes:
- Author scenes in the Spline editor; export the `.splinecode` URL → `sceneUrl`.
- Always ship a rendered PNG `posterSrc` (also the reduced-motion + slow-network
  fallback). Mark it decorative (`alt=""`) unless it conveys meaning.
- Spline runs its own render loop; mount **one** per screen and unmount offscreen
  heavy scenes (wrap in an `IntersectionObserver` gate for long pages).

---

## 3. React Three Fiber — code-authored floating glass object

Best when you want a controllable, dependency-light object (a floating glass
sphere/torus that drifts and reacts to the pointer) without a Spline asset.

**Install (one-time):**
```
pnpm --filter @release-hub/web add three @react-three/fiber @react-three/drei
```

`apps/web/src/components/nebula/GlassObject3D.tsx`

```tsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface GlassObject3DProps {
  className?: string
}

function Knot() {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh castShadow>
        <torusKnotGeometry args={[1, 0.34, 180, 32]} />
        <MeshTransmissionMaterial
          thickness={1.2}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.06}
          color="#6366f1"
          background={undefined}
        />
      </mesh>
    </Float>
  )
}

export function GlassObject3D({ className }: GlassObject3DProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('relative h-full w-full', className)}>
      <Suspense fallback={<Skeleton className="size-full rounded-3xl" />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 45 }}
          frameloop={reduceMotion ? 'demand' : 'always'}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#ec1e8c" />
          <pointLight position={[-5, -3, 2]} intensity={1.5} color="#6366f1" />
          <Knot />
          <Environment preset="city" />
        </Canvas>
      </Suspense>
    </div>
  )
}
```

Notes:
- `frameloop="demand"` under reduced motion → the scene renders once and freezes
  (no continuous animation) while staying visually rich.
- Clamp `dpr` to `[1, 2]` to protect low-power devices.
- Lighting carries the brand: a magenta key light + indigo fill = the Nebula glow
  in 3D.
- Keep geometry simple (one hero object). This is a focal accent, not a game.

---

## Performance & a11y checklist for any 3D

- [ ] Lazy-loaded (`lazy()` / dynamic `Canvas`) — never in the initial bundle.
- [ ] Poster/skeleton fallback while loading.
- [ ] Reduced-motion path: static poster (Spline) or frozen frame (R3F).
- [ ] One scene per screen; offscreen heavy scenes unmounted/paused.
- [ ] `dpr` clamped; geometry minimal.
- [ ] Decorative scenes are `aria-hidden` / `alt=""`; meaningful ones get a label.
