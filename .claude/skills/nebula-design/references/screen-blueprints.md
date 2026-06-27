# Nebula — Screen Blueprints

How to assemble the grammar + recipes into each kind of screen. Every blueprint
assumes the screen is wrapped in `<NebulaBackground>`, uses the feature folder
structure (`features/<feature>/<Name>Page.tsx`, default export, lazy), wires
`useTranslation('<feature>')`, and handles loading / error / empty / success.

Loudness budget per screen type (where to spend expression):

```
landing / auth      ████████████  full hero, 3D, gradient, big display
dashboard           ██████████░░  hero banner + 3D + glowing key metric
empty state         █████████░░░  3D object + bold line + one CTA
detail              ███████░░░░░  glass header, calm body
list / table        █████░░░░░░░  expressive frame, calm cells
form                █████░░░░░░░  glass slab + one gradient submit, clean fields
modal               ██████░░░░░░  glass, one accent action
```

---

## Dashboard

**Goal:** glanceable, earns the most expression.

Structure (top → bottom):
1. **Welcome banner** — `GlassCard` spanning full width, asymmetric: left =
   eyebrow + `text-display-lg` greeting + one `GradientButton`; right = `Scene3D`
   / `GlassObject3D` focal object. `glow="indigo"`.
2. **Stat row** — `grid md:grid-cols-3 lg:grid-cols-4 gap-6` of `StatCard`s in a
   `staggerContainer`. The single most important metric gets `glow="magenta"`; the
   rest `glow="indigo"`/`none`.
3. **Charts + activity** — `grid lg:grid-cols-3 gap-6`: a 2-col recharts area/bar
   (gradient fills from `--chart-*`) + a 1-col recent-activity `GlassCard` list.
4. Everything enters with `slideUp` under a `staggerContainer`.

Permissions: wrap admin-only tiles in `<Can I={Action.Read} a={Subject.X}>`.

See `references/example-dashboard-page.tsx` for the full build.

---

## List / Table page

**Goal:** expressive frame, calm cells, fast scanning.

Structure:
1. **Page header row** — `SectionHeading` (eyebrow + `text-display-md` title) on
   the left; on the right a pill `Input` (search) + filter `Select` (pill) + one
   `GradientButton` ("New …") gated by `<Can>`.
2. **Toolbar** (optional) — pill `Tabs` for status filters; active tab uses the
   gradient/indigo.
3. **`NebulaTable`** — glass frame, `text-overline` uppercase headers,
   `StatusBadge` pills, `font-mono tabular-nums` numeric cells, row hover glow.
   Row actions via shadcn `DropdownMenu` (pill trigger).
4. **Pagination / footer** — pill buttons, muted text, mono counts.

States: `PageLoader` skeleton rows inside the glass frame; `ErrorState` inside the
frame; `EmptyState` (see below) replacing the table.

---

## Detail page

**Goal:** glass header carries identity; body stays readable.

Structure:
1. **Hero header** — `GlassCard glow="indigo"`: breadcrumb, eyebrow (entity type),
   `text-display-md` title, `StatusBadge`, meta row (mono dates/ids), and primary
   action(s) — one `GradientButton`, secondary as standard `Button` variants.
2. **Body** — `grid lg:grid-cols-[2fr_1fr] gap-6`: main content in plain
   `GlassCard`s with normal type; sidebar with metadata/related `GlassCard`s.
3. Use shadcn `Tabs` (pill) for sub-sections (Overview / History / Settings).
4. Keep body text high-contrast and undecorated — the header is the loud part.

---

## Form / create-edit page

**Goal:** focused, one clear submit, clean fields.

Structure:
1. Narrow container (`max-w-2xl mx-auto`).
2. `SectionHeading` (eyebrow + title + one supporting line).
3. **One `GlassCard` slab** holding the form. Compose shadcn `Field` / `Label` /
   `Input` (pill via `PillInput`) / `Select` / `Textarea` / `Checkbox`.
4. **Footer:** right-aligned — secondary `Button variant="ghost"` (cancel) + one
   `GradientButton` (submit). Submit shows pending state (spinner + disabled).
5. **Focus glow** is the only per-field decoration (indigo ring). No rainbow
   borders. Validation errors use `--destructive` + an icon + helper text (color
   never the only signal).
6. Validation via `react-hook-form` + the project's validation approach; messages
   via `t()`.

---

## Auth page (login / register)

**Goal:** maximum expression — this is the front door.

Structure (split layout `lg:grid-cols-2`):
1. **Left (or right) panel** — full `bg-nebula-aurora` over void with a large
   `Scene3D` focal object, the product `text-display-xl` line, and an eyebrow.
   Hidden on small screens (`hidden lg:block`).
2. **Form panel** — centered `GlassCard glow="indigo"`, `rounded-4xl`: logo,
   `text-display-md` heading, pill inputs, one `GradientButton` submit, muted
   helper links (pill ghost buttons / underlined links).
3. Background aurora bleeds behind both panels for cohesion.

Matches the existing `auth/common.json` namespace.

---

## Empty state

**Goal:** turn nothing into an invitation.

Structure (centered):
1. A small `Scene3D` / `GlassObject3D` or a glowing lucide icon in a glass circle.
2. `text-display-md` headline ("Nothing here yet" energy, via `t()`).
3. One muted supporting line.
4. One `GradientButton` CTA (the thing to create) — gated by `<Can>`.
5. Subtle `float` on the visual; `scaleIn` entrance.

Build it as the shared `EmptyState` so every feature reuses it (pass icon/scene,
title, description, action as props).

---

## Modal / dialog

**Goal:** a glass slab floating over a dimmed, blurred void.

- shadcn `Dialog` with overlay `bg-background/70 backdrop-blur-sm`.
- `DialogContent` → `glass rounded-3xl shadow-glow-indigo`.
- Title in `font-display`, one `GradientButton` confirm + ghost cancel.
- Destructive confirmations: `AlertDialog`, confirm button uses `--destructive`
  (rose), not the gradient (reserve the gradient for positive primary actions).

---

## Universal screen checklist (run before done)

- [ ] Wrapped in `NebulaBackground`; aurora subtle, doesn't hurt contrast.
- [ ] Exactly one `bg-nebula-gradient` CTA; at most one `glow="magenta"`.
- [ ] Headline is the loudest object (`text-display-*`, `font-display`).
- [ ] Pills for controls, glass slabs for containers; no stray sharp corners.
- [ ] Numbers `font-mono tabular-nums`.
- [ ] Entrance stagger + reduced-motion fallback.
- [ ] All four data states handled and styled.
- [ ] shadcn primitives only; missing ones installed via CLI.
- [ ] Typed, no comments, no `any`; named exports (default only for the page).
- [ ] All text via `t()` in the feature namespace; statuses/roles from enums.
- [ ] CASL gates on restricted actions/content.
- [ ] AA contrast verified on glass-over-aurora surfaces.
