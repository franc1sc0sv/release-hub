---
name: nebula-design
description: >-
  Nebula is the Release Hub visual design language (apps/web) — a dark, electric
  system: deep-navy void, indigo→magenta glow, glass surfaces, bold display
  type, 8px control/surface geometry, flat depth styling via glass + glow. NO 3D
  figures anywhere (user removed them); never simulate 3D with CSS — real 3D
  library or nothing. Use this skill when
  designing or building ANY new screen, page, component, dashboard, table, form,
  empty state, modal, or auth view in apps/web; when restyling existing UI; or
  when the user asks to "make it look good", "make it on-brand", "apply the
  design system", "design a screen", or "nebula". Composes shadcn/ui +
  Tailwind v4 tokens + Framer Motion.
---

# Nebula — Release Hub Design Language

Nebula turns marketing-grade hero energy into a working product UI. The reference
screenshots are landing pages; Release Hub is an app (dashboards, tables, forms,
role-gated screens). **The job of this skill is to keep the hero energy — bold
type, accent discipline, tactile depth — while it survives a data table.**

## The one-sentence identity

> A deep-navy void, lit from within by an indigo→magenta gradient, where glass
> surfaces float in generous space, anchored by oversized grotesque type and
> disciplined 8px geometry.

## The five-part grammar (every Nebula screen obeys all five)

1. **Oversized confident type.** Heavy geometric-grotesque display, *tight*
   leading, big sizes. The headline is the loudest object on the screen. Use the
   `text-display-*` scale.
2. **8px control/surface geometry.** Every control (buttons, inputs, selects,
   textareas, search fields, dropdown triggers) uses `rounded-[var(--radius-button)]`
   (8px). Every surface (cards, panels, modals, popovers, sheets) uses
   `rounded-[var(--radius-card)]` (8px). `rounded-full` is reserved **only** for
   badges, tags, chips, avatars, and icon-circles — never for a control or a
   container. No sharp corners, no pill buttons, no `rounded-3xl`/`rounded-4xl`
   cards.
3. **Tactile depth — flat styling, no 3D figures.** Every screen has a depth
   ladder: void → aurora glow → glass surface → content → glowing accent, built
   from glass, glow, and soft shadow. **This app has NO 3D figures — the user
   removed all of them; do not reintroduce scenes or their dependencies without
   an explicit request. And never simulate a 3D object with CSS: if a 3D figure
   is ever explicitly requested again, build it with a real 3D library
   (React Three Fiber / Spline) — CSS-faked 3D is forbidden in all cases.**
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
   focal visual (a glass stat card, key metric, or lucide icon treatment — no 3D
   figures, no CSS-faked 3D). Add an eyebrow/overline above it.
4. **Build with glass + 8px controls.** Containers = `GlassCard`
   (`rounded-[var(--radius-card)]`). Buttons/inputs/selects/textareas/dropdown
   triggers = `rounded-[var(--radius-button)]`. Badges/tags/chips/avatars stay
   pill (`rounded-full`). Compose from shadcn primitives; apply Nebula recipes
   from `references/component-recipes.md`.
5. **Spend the accent once.** Exactly one `bg-nebula-gradient` primary CTA. Magenta
   only on the single key highlight (active state, key metric, the spark).
6. **Wire depth.** Glow on the focal/active elements (`shadow-glow-*`), glass on
   surfaces, soft ambient shadow on floats. Each layer one step brighter than the
   one behind it.
7. **Add motion.** Entrance stagger (`stagger` + `slideUp`), hover lift+glow, tap
   spring. Reduced-motion → static. See `references/motion-and-3d.md`.
8. **Handle the four states** with the shared feedback components, each styled
   Nebula (empty state gets an icon treatment + bold line + accent CTA).
9. **Audit.** shadcn-first ✓, typed ✓, no comments ✓, i18n ✓, enums not strings ✓,
   CASL ✓, AA contrast ✓, one gradient CTA ✓, reduced-motion ✓, controls/surfaces
   at 8px ✓, `rounded-full` only on badges/tags/chips/avatars ✓.

## Token quick reference (available after one-time setup)

Colors: `bg-background` `text-foreground` `bg-card` `text-muted-foreground`
`bg-primary` `border-border` · brand: `bg-brand-indigo` `text-brand-magenta`
`bg-brand-indigo-bright` · `bg-nebula-gradient` (the signature CTA/headline fill).
Glow: `shadow-glow-indigo` `shadow-glow-magenta` `shadow-glow-sm|md|lg` ·
`shadow-glass`. Type: `text-display-2xl|xl|lg|md` · `font-display` `font-mono`.
Radius: `rounded-[var(--radius-button)]` (8px, all controls) ·
`rounded-[var(--radius-card)]` (8px, all surfaces) · `rounded-full` (badges, tags,
chips, avatars, icon-circles only).

Full list and values: `references/tokens.css`.

## One-time setup (do this before using Nebula in the app)

1. **Tokens:** merge `references/tokens.css` into `apps/web/src/index.css`
   (recolors shadcn semantic vars to the dark canvas + adds brand/glow/gradient/
   display-type/radius tokens). Keeps shadcn semantics intact.
2. **Animation presets:** add `apps/web/src/lib/animations.ts` from
   `references/motion-and-3d.md` (Framer presets, reduced-motion aware; ignore
   the retired 3D sections of that file).
3. **Shared Nebula components:** add `NebulaBackground`, `GlassCard`,
   `GradientButton` etc. from `references/component-recipes.md` into
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
