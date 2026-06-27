# Nebula — Design Language (the why)

This is the reasoning behind the tokens. Read it when you have to make a judgment
call the recipes don't cover. The screenshots that seeded Nebula were marketing
heroes (glu, FANCY.DESIGN, Bullo, etail.me); the through-line across all four is a
**five-part grammar** that we carry into a product UI.

## 1. Color — a calm void, one gradient of light

Nebula is **dark-first**. The canvas is a deep navy-black void (`--background:
#0a0817`) with an indigo undertone — not pure black, which reads cheap and flat.
Everything else is a controlled rise out of that void.

**The depth ladder (memorize this — it governs every surface):**

```
void  (#0a0817)  →  background, the page
glow  (aurora)   →  blurred indigo/magenta radial light behind content
glass (#110e22)  →  cards/surfaces, semi-transparent, blurred, hairline border
content          →  text + controls
accent           →  the gradient CTA / glowing focal element
```

Each step is one notch brighter than the one behind it. If two adjacent layers
have the same luminance, the screen goes muddy. When in doubt, darken the
background and brighten the focal element.

**The accent is two colors doing two jobs:**

- **Indigo `#2a2483` is the brand *anchor*.** It is deep — too dark to sit on the
  void as an interactive control. Use it for gradient *dark stops*, deep fills,
  and structural brand presence.
- **Electric indigo `#6366f1` (`--primary`, `--ring`) is the *interactive* color.**
  This is what users click and focus. The anchor and the interactive color are
  different on purpose — a brand color and a usable control color are rarely the
  same value on a dark canvas. Never put `#2a2483` on `#0a0817` and expect it to
  read as a button.
- **Magenta `#ec1e8c` is the *spark*.** It is the single loudest hue and must stay
  rare — the one key metric, the active nav item, the destructive-but-important
  moment, the end of the signature gradient. If magenta appears more than once or
  twice per view, it stops meaning "look here".

**The signature gradient** (`bg-nebula-gradient`, `text-nebula-gradient`) runs
indigo→violet→magenta. It is the visual signature of the whole system. Reserve it
for: the **one** primary CTA per view, hero headline accents, focus glows, and the
active state of the primary navigation. It is a seasoning, not a sauce.

**Semantic colors** keep shadcn's meaning: `--destructive` is a rose `#f43f5e`
(harmonizes with magenta rather than clashing). Success/warning come from the
chart spectrum (`--chart-4` cyan reads as positive, `--chart-5` amber as caution)
when you need them — define explicit `--success`/`--warning` tokens only if a
feature truly needs them.

**Do NOT hijack shadcn semantics.** `--accent` in shadcn is a *muted hover
surface*, not a vivid accent — recoloring it magenta would turn every dropdown
hover magenta. The vivid brand colors live in the separate `--brand-*` tokens.

## 2. Type — the headline is a character in the scene

The display face is **Space Grotesk** (`--font-display`) — a geometric grotesque
with mechanical, slightly-quirky character that reads "electric / techy", matching
the dark-neon temperature. Body is **Inter** (`--font-sans`); data and numbers are
**JetBrains Mono** (`--font-mono`).

The `text-display-*` ramp is built for impact: **tight leading** (0.95–1.05),
**negative tracking** (−0.02 to −0.035em), and **fluid `clamp()` sizes** so the
hero stays huge on desktop and sane on mobile. The headline should be the largest,
heaviest thing on screen — often 2–4× the next element. Lowercase or sentence case
feels modern and human (glu, etail); ALL CAPS feels loud and graphic (Bullo) — use
caps sparingly for maximum-impact moments.

**The eyebrow/overline** (`text-overline`: tiny, `uppercase`, wide tracking,
semibold, usually `text-muted-foreground` or `text-brand-magenta`) sits above big
headlines to add rhythm — the "HOME · SERVICES · COMPANY" energy from the nav,
repurposed as a section label.

**Numbers calm the noise.** In an "expressive everywhere" system, set metrics,
table figures, timestamps, and IDs in `font-mono` with tabular spacing. It makes
dense data legible *and* reads as precise/technical, which fits the temperature.

## 3. Geometry — everything is a pill or a soft slab

Two shapes only:

- **Pills** (`rounded-full`): buttons, nav bars, inputs, badges, chips, avatars,
  toggle groups, the play/control buttons. This is the single most unifying signal
  in the reference set — copy it relentlessly.
- **Soft slabs** (`rounded-3xl` / `rounded-4xl`): cards, panels, modals, the app
  shell regions. Large radii, never sharp.

The radius scale already present in the app (`--radius: 0.75rem` with sm→4xl
multipliers) supports both. Nebula lives at the extremes: `rounded-full` for
controls, `rounded-3xl`+ for containers, and rarely anything in between.

## 4. Depth — glass, glow, and real 3D

Depth is *felt*, not drawn. Three tools, in order of cost:

1. **Glass** (`glass` utility): semi-transparent card color + `backdrop-blur` +
   a hairline `white/8%` border + the `--shadow-glass` (which includes an inner
   top highlight). This is the default surface for every panel. It lets the aurora
   glow bleed through, tying surfaces to the void.
2. **Glow** (`shadow-glow-*`): a colored, blurred shadow on focal/active elements.
   Indigo glow by default; magenta glow on the spark. Glow is how Nebula says
   "this is alive / interactive / important". Hover should *intensify* glow.
3. **Real 3D** (Spline / React Three Fiber): one tactile object per hero moment —
   dashboard welcome banner, auth screen, empty state, landing. Glassy/glossy
   materials, soft env lighting, gentle infinite float, subtle pointer parallax.
   3D is expensive; budget one scene per screen, lazy-load it, and fall back to a
   static poster under `prefers-reduced-motion` or when offscreen. See
   `motion-and-3d.md`.

The **aurora** (`bg-nebula-aurora`) is the connective tissue: 2–3 large, blurred,
low-opacity radial gradients (indigo top-left, magenta top-right, violet
bottom-right) sitting between the void and the content. It is what makes a flat
dark page feel like lit space. Keep it subtle — it should never compete with text
contrast.

## 5. Space & rhythm — let it float

Generous whitespace is non-negotiable; it is what separates "premium" from "busy".
Lead with a strong max-width container (`max-w-6xl`/`max-w-7xl` for app content,
narrower for forms/auth), big section gaps (`gap-8`/`gap-12`), and asymmetry —
text on one side, the visual focal point on the other, the way every reference
hero is built. The single arrow motif (`ArrowUpRight` / `ArrowRight`) marks the
one action that matters and nothing else.

## Motion philosophy

Motion should feel like objects settling into a calm space, not bouncing around.
- **Entrance:** content fades + rises (`slideUp`) with a **stagger** so the eye
  reads top-to-bottom. Keep durations short (0.3–0.5s) and easing soft.
- **Hover:** lift (`y: -2`) + glow intensifies. Cheap, consistent, everywhere.
- **Tap:** a quick spring scale to ~0.97 — tactile confirmation.
- **Ambient:** 3D objects and aurora drift slowly and infinitely; nothing else
  loops (looping UI is noise).
- **Reduced motion:** `useReducedMotion` collapses all of the above to instant /
  static. This is a hard requirement, not a nicety.

All presets live in `lib/animations.ts` so motion is consistent and tunable in one
place.

## Accessibility contract (binds even "expressive everywhere")

"Expressive everywhere" means depth and accent reach every surface — it does **not**
license unreadable UI. Hard floors:

- **Contrast:** body text ≥ 4.5:1, large text ≥ 3:1, against its *actual* surface
  (remember glass is semi-transparent over aurora — check the effective bg). The
  chosen `--foreground`/`--muted-foreground` clear AA on the dark canvas; verify
  any custom pairing.
- **Color is never the only signal.** Status, validity, and emphasis pair color
  with an icon, label, or weight — magenta-only meaning fails for color-blind
  users and in glow-heavy contexts.
- **Focus is always visible.** The indigo `--ring` glow is the focus indicator;
  never remove it. Pills must show a clear focus ring.
- **Motion respects `prefers-reduced-motion`** at all times.
- **Glass over busy backgrounds** can drop contrast — increase the card's opacity
  (`--card` mix %) behind dense text rather than thinning it for looks.

## Applying Nebula to dense product UI

The temptation in "expressive everywhere" is to make tables glow and forms shout.
The discipline: **expressive *frame*, calm *content*.**
- Table/list *chrome* (header, container, row hover, status pills, pagination) is
  full Nebula glass + accent. Table *cells* (the data) stay high-contrast, mono
  for numbers, no per-cell decoration.
- Form *container* is a glass slab with a bold heading and one gradient submit;
  *fields* are clean pills with a single indigo focus glow — not rainbow borders.
- Dashboards earn the most expression (hero banner + 3D + glowing key metric +
  gradient chart fills) because they are glanceable, not read line-by-line.

The result reads as one confident, premium, electric product — loud where it
guides the eye, calm where the user actually works.
