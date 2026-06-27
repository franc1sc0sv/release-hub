---
name: nebula-design
description: >-
  Nebula is the Release Hub visual design language (apps/web) — a dark, electric,
  3D-forward system: deep-navy void, indigo→magenta glow, glass surfaces, bold
  display type, pill geometry, and tactile depth via Spline / React Three Fiber.
  Use this skill when designing or building ANY new screen, page, component,
  dashboard, table, form, empty state, modal, or auth view in apps/web; when
  restyling existing UI; or when the user asks to "make it look good",
  "make it on-brand", "apply the design system", "design a screen", or "nebula".
  Composes shadcn/ui + Tailwind v4 tokens + Framer Motion + Spline/R3F.
---

# Nebula — Release Hub Design Language

Nebula turns marketing-grade hero energy into a working product UI. The reference
screenshots are landing pages; Release Hub is an app (dashboards, tables, forms,
role-gated screens). **The job of this skill is to keep the hero energy — bold
type, pill geometry, accent discipline, tactile depth — while it survives a data
table.**

## The one-sentence identity

> A deep-navy void, lit from within by an indigo→magenta gradient, where glass
> surfaces and tactile 3D objects float in generous space, anchored by oversized
> grotesque type and fully-pill geometry.

## The five-part grammar (every Nebula screen obeys all five)

1. **Oversized confident type.** Heavy geometric-grotesque display, *tight*
   leading, big sizes. The headline is the loudest object on the screen. Use the
   `text-display-*` scale.
2. **Pill geometry.** Buttons, nav, inputs, badges, chips → `rounded-full`.
   Containers → large radius glass cards (`rounded-3xl`/`rounded-4xl`). No sharp
   corners.
3. **Tactile depth.** Every screen has a depth ladder: void → aurora glow → glass
   surface → content → glowing accent. Hero moments get real 3D (Spline / R3F);
   every other surface gets CSS depth (glass, glow, soft shadow).
4. **Accent discipline.** A calm dark canvas carries **one** primary action in the
   `bg-nebula-gradient` (indigo→magenta) per view. Magenta is the *spark* — used
   only for the single most important highlight. Everything else is neutral.
5. **Air + asymmetry.** Generous spacing; content floats. A single arrow motif
   (`→` / `↗`, lucide `ArrowUpRight`/`ArrowRight`) marks the one action that
   matters.

## Non-negotiable rules

**Project rules (from CLAUDE.md — these override aesthetics):**
- **shadcn/ui first.** Compose the 33 installed primitives. Never build a button,
  input, dialog, table, card, etc. from scratch. Install missing ones with
  `pnpm dlx shadcn@latest add <component>`.
- **No comments** in any code you write — names and structure carry meaning.
- **No `any`**, no `@ts-ignore`, no unsafe casts. Everything explicitly typed.
- **No hardcoded UI text.** Every user-facing string via `useTranslation('<ns>')`.
  Add a feature namespace; don't dump everything in `common`.
- **No magic strings** for domain values (roles, statuses, actions) — use the
  `as const` enums from `@release-hub/shared`.
- **CASL for permissions** — `<Can>` / `useAbility()`, never `role === '...'`.
- **Named exports**, except default export for lazy-loaded page components.
- **Apollo = server state, Context = client state.** Handle all four states
  (loading / error / empty / success).

**Design rules (Nebula-specific):**
- **Dark is canonical.** Design dark-first. The light variant exists but Nebula
  *is* the dark canvas. Default new screens to dark.
- **Contrast is a hard floor, even "expressive everywhere".** Body text ≥ WCAG AA
  on its surface; the accent is never the *only* signal (pair color with icon /
  label / weight). Expressive ≠ unreadable.
- **One gradient CTA per view.** If everything glows, nothing glows.
- **Animate with Framer Motion** using the presets in `lib/animations.ts`; always
  respect `prefers-reduced-motion` (`useReducedMotion`).
- **Numbers/data in `font-mono`** (tabular, calm) inside the expressive shell.

## The screen-design process (repeatable — follow in order)

When asked to design/build a new screen:

1. **Place it.** Decide the feature folder (`features/<feature>/`), page file
   (`<Name>Page.tsx`, default export, lazy), and i18n namespace. See
   `references/screen-blueprints.md`.
2. **Lay the canvas.** Wrap the screen in `<NebulaBackground>` (void + 1–2 aurora
   blobs). Establish the spacing rhythm and a max-width container.
3. **Set the hero.** One `text-display-*` headline as the loudest object + one
   focal visual (3D scene for landing/empty/auth/dashboard banner; a glass
   stat/illustration elsewhere). Add an eyebrow/overline above it.
4. **Build with glass + pills.** Containers = `GlassCard`. Actions/inputs/badges =
   pill. Compose from shadcn primitives; apply Nebula recipes from
   `references/component-recipes.md`.
5. **Spend the accent once.** Exactly one `bg-nebula-gradient` primary CTA. Magenta
   only on the single key highlight (active state, key metric, the spark).
6. **Wire depth.** Glow on the focal/active elements (`shadow-glow-*`), glass on
   surfaces, soft ambient shadow on floats. Each layer one step brighter than the
   one behind it.
7. **Add motion.** Entrance stagger (`stagger` + `slideUp`), hover lift+glow, tap
   spring. Reduced-motion → static. See `references/motion-and-3d.md`.
8. **Handle the four states** with the shared feedback components, each styled
   Nebula (empty state gets a 3D object + bold line + accent CTA).
9. **Audit.** shadcn-first ✓, typed ✓, no comments ✓, i18n ✓, enums not strings ✓,
   CASL ✓, AA contrast ✓, one gradient CTA ✓, reduced-motion ✓.

## Token quick reference (available after one-time setup)

Colors: `bg-background` `text-foreground` `bg-card` `text-muted-foreground`
`bg-primary` `border-border` · brand: `bg-brand-indigo` `text-brand-magenta`
`bg-brand-indigo-bright` · `bg-nebula-gradient` (the signature CTA/headline fill).
Glow: `shadow-glow-indigo` `shadow-glow-magenta` `shadow-glow-sm|md|lg` ·
`shadow-glass`. Type: `text-display-2xl|xl|lg|md` · `font-display` `font-mono`.
Radius: `rounded-full` (pills) · `rounded-3xl`/`rounded-4xl` (cards).

Full list and values: `references/tokens.css`.

## One-time setup (do this before using Nebula in the app)

1. **Tokens:** merge `references/tokens.css` into `apps/web/src/index.css`
   (recolors shadcn semantic vars to the dark canvas + adds brand/glow/gradient/
   display-type tokens). Keeps shadcn semantics intact.
2. **3D deps:**
   `pnpm --filter @release-hub/web add @splinetool/react-spline @splinetool/runtime`
   and (for custom R3F scenes)
   `pnpm --filter @release-hub/web add three @react-three/fiber @react-three/drei`.
3. **Animation presets:** add `apps/web/src/lib/animations.ts` from
   `references/motion-and-3d.md` (Framer presets, reduced-motion aware).
4. **Shared Nebula components:** add `NebulaBackground`, `GlassCard`,
   `Scene3D`, `GradientButton` etc. from `references/component-recipes.md` into
   `apps/web/src/components/nebula/`.

## Reference files (load on demand — don't read all up front)

- `references/design-language.md` — the *why*: color roles, type ramp, spacing
  rhythm, depth model, motion philosophy, the brand-anchor-vs-interactive-accent
  rule, accessibility contract. Read when making a design judgment call.
- `references/tokens.css` — copy-paste-ready Tailwind v4 `@theme` + `:root`/`.dark`
  values. Read when setting up or extending tokens.
- `references/component-recipes.md` — shadcn compositions for the recurring Nebula
  patterns (background, glass card, gradient button, floating pill nav, stat card,
  expressive data table, pill input, badges, section heading). Read when building
  components.
- `references/motion-and-3d.md` — Framer Motion presets + `lib/animations.ts`, the
  `Scene3D` Spline wrapper, and an R3F floating-glass-object recipe. Read for
  motion or 3D.
- `references/screen-blueprints.md` — full per-screen blueprints (dashboard, list/
  table, detail, form, auth, empty, modal). Read when starting a new screen.
- `references/example-dashboard-page.tsx` — a complete, rule-compliant worked
  example. Read to see everything composed end-to-end.
