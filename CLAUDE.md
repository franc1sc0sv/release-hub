# Release Hub

Release Hub. Turbo + pnpm monorepo with a React frontend, a NestJS GraphQL API, and a Prisma 7 + Kysely database layer. i18n-ready UI (en/es), English codebase.

## Workspaces

| Workspace | Purpose | Entry | Key Dependencies |
|---|---|---|---|
| `apps/web` | React SPA | `src/main.tsx` | React 19, Vite, Tailwind v4, shadcn/ui, React Router v7 |
| `apps/api` | NestJS GraphQL API | `src/main.ts` | NestJS 10, Apollo, @nestjs/cqrs, Passport JWT |
| `packages/shared` | CASL authorization enums + ability factory | `src/index.ts` | @casl/ability |
| `packages/db` | Prisma + Kysely | `src/index.ts` | Prisma 7, @prisma/adapter-pg, Kysely |

## CRITICAL: Frontend UI Rule

**All frontend UI changes and new components MUST use shadcn/ui.** No exceptions.

- Check shadcn/ui for an existing primitive before writing any UI code
- Install missing components: `pnpm dlx shadcn@latest add <component>`
- Never build buttons, inputs, dialogs, tables, cards, etc. from scratch

## Design Language: Nebula

**The visual language for all of `apps/web` is Nebula** — dark & electric: a deep-navy void, indigo (`#2A2483`) → magenta (`#EC1E8C`) accent, glass surfaces, bold display type, pill geometry, and tactile 3D (Spline / React Three Fiber). shadcn/ui supplies the primitives; **Nebula governs how they look and compose.**

- **Invoke the `nebula-design` skill** when designing or building any new screen, page, component, dashboard, table, form, empty state, modal, or auth view — or when restyling existing UI.
- Tokens, component recipes, motion/3D setup, and per-screen blueprints live in `.claude/skills/nebula-design/` (`SKILL.md` + `references/`).
- Core rules: one `bg-nebula-gradient` CTA per view; magenta is the rare spark; pills for controls, glass slabs (`rounded-3xl`+) for containers; numbers in `font-mono`; **expressive frame / calm content**; WCAG AA contrast is a hard floor; animate via `lib/animations.ts` and respect `prefers-reduced-motion`.

## Domain Model

Release Hub turns a repository's history into a client-ready release. A **Project = one repository**. The permanent ledger is **Features**: every merged PR (and its commits) is traceable to a feature across every release it appears in.

### Entities (Prisma models — snake_case `@map`/`@@map`, soft-delete where sensible)

| Model | Purpose | Key relations |
|---|---|---|
| `Project` | One repository; owns features, releases, integration config | → `Feature[]`, `Release[]`, `Membership[]`, `Invitation[]` |
| `Feature` | Permanent ledger unit; `name`/`description`/`category` (description feeds the AI matcher) | belongs to `Project`; ← `FeatureInRelease[]` |
| `Release` | A branch diff (`baseRef` ↔ `compareRef`) shipped as PR + tag | belongs to `Project`; ← `PullRequest[]`, `FeatureInRelease[]` |
| `PullRequest` | **The assignment unit** (1 PR = 1 feature); first-level unit shown | belongs to `Release`; optional `featureId`; ← `Commit[]`, optional `TicketLink` |
| `Commit` | Read-only detail nested under its PR | belongs to `PullRequest` |
| `FeatureInRelease` | Ledger join + per-release **state snapshot** (`state`, `flagState`) | links `Feature` ↔ `Release` |
| `TicketLink` | Detected ticket ref (Linear/Jira) for a PR | belongs to `PullRequest` |
| `Membership` | User ↔ Project with a per-project `ProjectRole` | links `User` ↔ `Project` |
| `Invitation` | Email invite to a project (`token`, `status`, `expiresAt`, `invitedBy`) | belongs to `Project` |

### Enums (`as const` / Prisma enums — never magic strings)

- `FeatureKind` — `product` | `default` (default/system features absorb every non-product PR; never complete)
- `FeatureCategory` — `Product` | `Infra Changes` | `Integration Tests` | `E2E Tests` | `Dev/Chore`
- `FeatureState` — `in_progress` | `shipped_flag_off` | `live_staging` | `live_prod` | `partial` | `fully_released` | `flag_cleanup_pending` | `blocked`
- `ReleaseType` — `feature` | `hotfix`
- `ReleaseStatus` — `draft` | `pr_created` | `merged` | `deployed`
- `FlagAction` — `added` | `modified` | `removed` | `unchanged`
- `TicketSource` — `linear` | `jira`
- `ProjectRole` — `owner` (members + settings) | `member` (full build access) | `viewer` (read-only)
- `InvitationStatus` — `pending` | `accepted` | `expired` | `revoked`

### Invariants (do not re-litigate)

- **Hierarchy:** `Feature → Releases → PullRequests → Commits`. The PR is always the first-level unit; commits are read-only detail nested under their PR. A squash-merged PR shows its one commit — never bare/loose commits.
- **Coverage:** every merged PR in a release is assigned to a feature (product or default). Default features absorb non-product PRs, so there is no "excluded" state. The **coverage gate blocks "ready for production" until coverage is 100%**.
- **Two views, one tree:** Feature view (`Feature → Releases → PRs → commits`) and Release view (`Release → Features → PRs → commits`).
- **Derived client language:** the summary's availability wording is **derived from `FeatureState` + `FlagState`**, never typed freehand — so we never report "available" when a flag is off. The enum→client-line mapping lives in the AI prompt (§B) and a shared enum→i18n-key map.
- **Tags** group the one-summary-per-release into sections; tag taxonomy is **managed per project**.
- **Release detection = branch diff:** merged PRs in `compareRef` not in `baseRef`. Merge-agnostic.

### Integrations (all REAL — no mocks)

- **GitHub (required)** — GitHub App; branch diff → merged PRs with nested commits.
- **Flagsmith (optional, connection-gated)** — Admin API + Organisation API token; flag matrix (staging × prod), parity gate (blocks the "live in prod / off in staging" quadrant), orphan/ghost detection vs a static code scan. Off → no flag gate; states set manually.
- **Linear (optional, connection-gated)** — read-only; detect PR issue refs → confirm via API → pull title/description for AI context. Behind a `TicketSource` interface so Jira can slot in later. Off → manual naming, thinner AI draft.

Optional integrations degrade gracefully when disconnected — their UI hides and dependent gates relax.

## Architecture Rules

### CQRS (non-negotiable)

- Every write operation: `@CommandHandler` extending `BaseCommandHandler` in `common/cqrs/`
- Every read operation: `@QueryHandler` extending `BaseQueryHandler` in `common/cqrs/`
- No service classes — one handler per operation
- Resolvers are thin: dispatch to `CommandBus`/`QueryBus`, zero business logic

### Transactions

- **Always transactional** — both commands AND queries wrap in `$transaction`
- Repositories require `tx: TxClient` — enforced at compile time via `RepositoryMethod` type
- Use `RepositoryMethod<[...args], TReturn>` in abstract repo classes — makes `tx` structurally required
- All repository interfaces must implement `IBaseRepository<TEntity>` from `common/cqrs/`
- `IDatabaseService` only exposes `$transaction()` — no `get client()`

### Inversion of Control

- All dependencies via abstract classes as NestJS DI tokens
- Handlers never import concrete classes
- Module wires: `{ provide: IXRepository, useClass: XRepository }`
- Global abstractions: `IDatabaseService`, `IEventEmitter`
- Per-module abstractions: `IPostRepository`, `IUserRepository`, etc.

### Vertical Slice Structure

```
modules/[domain]/
├── [domain].module.ts
├── interfaces/          ← abstract repos + domain interfaces
├── repositories/        ← concrete Prisma implementations
├── resolvers/           ← thin GraphQL resolvers
├── commands/[action]-[resource]/
├── queries/[action]-[resource]/
├── events/              ← event interfaces + classes
└── types/               ← @ObjectType GraphQL output shapes
```

### Validation

- `class-validator` decorators on `@InputType()` classes
- `ValidationPipe` enabled globally with `whitelist`, `forbidNonWhitelisted`, `transform`
- No Zod anywhere

### Authorization (CASL)

`@release-hub/shared` is the single source of truth for all authorization. It exports:
- `Action`, `Subject`, `ProjectRole` — `as const` enum objects (never use magic strings)
- `defineAbilityFor(memberships: IProjectMembership[])` — builds a project-scoped CASL `AppAbility` from the caller's memberships
- `defineGateAbility()` — coarse route-level gate (no role); every authenticated user passes, handlers do the fine-grained per-project checks

**There is no platform user role.** Authorization is purely **project-scoped**: a user's abilities come entirely from their `Membership` `ProjectRole` on each project. The domain subjects `PROJECT`, `RELEASE`, `FEATURE`, `PULL_REQUEST`, `MEMBERSHIP`, and `INVITATION` are granted via CASL `conditions` on `projectId`. Reuse the existing `READ`/`CREATE`/`UPDATE`/`DELETE`/`MANAGE` actions:
- `owner` — manage members + settings + full build access (`MANAGE` on `MEMBERSHIP`/`INVITATION`/`PROJECT`)
- `member` — full build access (`CREATE`/`UPDATE` on `RELEASE`/`FEATURE`/`PULL_REQUEST`), no member/settings management
- `viewer` — read-only (`READ` on project-scoped subjects)

Handlers resolve the caller's `Membership[]`, build `defineAbilityFor(memberships)`, then check `ability.can(Action.X, subject(Subject.Y, { projectId }))`. Non-members get `ForbiddenException`.

**Backend enforcement (apps/api):**
1. `PoliciesGuard` (route-level) — calls `defineGateAbility()`, checks the `@Can()` decorator (coarse gate; every authenticated user passes)
2. Handler (resource-level) — resolves the caller's `Membership[]`, calls `defineAbilityFor(memberships)`, checks `ability.can(Action.X, subject(Subject.Y, { projectId }))`, throws `ForbiddenException`
3. Both layers are mandatory — guard = coarse gate, handler = fine-grained project-scoped check

**Frontend rendering (apps/web):**
1. `AbilityProvider` — calls `defineAbilityFor(memberships)` (from the `me` query + project memberships), pushes ability into React context
2. `<Can I={Action.X} a={Subject.Y}>` — conditionally renders UI elements (nav items, buttons)
3. `RequireAbility` — route-level guard, redirects to `/dashboard` if denied

**Adding a new permission (checklist):**
1. `packages/shared/src/casl.ts` — add enum value to `Action`/`Subject` if new, add `can()` rule to relevant roles (for project-scoped subjects, attach a `{ projectId }` condition keyed off `ProjectRole`)
2. `apps/api` — add `@Can(Action.X, Subject.Y)` on resolver + `ability.can()` check inside handler (project-scoped: resolve the caller's `Membership` and check against `subject(Subject.Y, { projectId })`)
3. `apps/web` — wrap UI element with `<Can I={Action.X} a={Subject.Y}>` or add `RequireAbility` route guard
4. Always use enum values (`Action.CREATE`, `Subject.USER`, `ProjectRole.OWNER`) — never raw strings

### Domain Events

- All events implement `IDomainEvent` (requires `eventName` + `occurredAt`)
- Event interfaces in `events/[domain].events.ts`, classes in `events/[action]-[entity].event.ts`
- Collected during `handle()`, emitted after transaction commits via `IEventEmitter`

### Types

- All domain types in dedicated `interfaces/` files — no inline declarations
- Interfaces use `I` prefix: `IPost`, `ICreatePostData`, `IPostFilters`
- Event interfaces extend `IDomainEvent`
- GraphQL types (`@ObjectType`, `@InputType`) are classes in `types/` and `commands/`

## Database

- **Prisma 7**: generator `prisma-client` with `output = "../src/generated/client"`
- **Config**: `prisma.config.ts` — no `env()` helper, use `process.env`
- **Client**: `src/prisma-client.ts` imports from `./generated/client/client`
- **Adapter**: `PrismaPg(process.env.DATABASE_URL!)` — connection string directly, no Pool
- **Kysely**: DummyDriver pattern — query building only, execute via `tx.$queryRawUnsafe()`
- **Types**: auto-generated as `DB` in `src/types.ts` via `prisma-kysely`
- **Schema**: all columns snake_case via `@map()`/`@@map()`
- **Soft delete**: `deletedAt DateTime?` — add it to any model that needs it (the skeleton applies it to `User`); always filter `deletedAt: null` in reads
- **After schema changes**: run `prisma generate` then `prisma migrate dev --name descriptive_name`

## GraphQL

### Code-First Backend → Codegen Frontend

The GraphQL pipeline is:
1. **Backend (code-first)**: `@ObjectType`, `@InputType`, `@Resolver` decorators → NestJS auto-generates `apps/api/src/schema.gql` via `autoSchemaFile`
2. **Frontend (codegen)**: `apps/web/codegen.ts` reads `schema.gql`, scans `src/**/*.{ts,tsx}` for `gql` tagged templates, generates typed operations into `apps/web/src/generated/`

### Frontend Usage

Use the generated `graphql()` function from `src/generated/gql` — NOT `gql` from `@apollo/client`:
```typescript
import { graphql } from '@/generated/gql'
import { useQuery } from '@apollo/client'

const GET_WIDGETS = graphql(`
  query GetWidgets($filters: WidgetFiltersInput) {
    widgets(filters: $filters) { id name }
  }
`)

const { data } = useQuery(GET_WIDGETS, { variables: { filters } })
// data is fully typed — no manual generics needed
```

### Workflow

- **After backend schema changes**: `pnpm --filter @release-hub/api dev` → `schema.gql` regenerates automatically
- **After adding/changing frontend operations**: `pnpm --filter @release-hub/web generate` → regenerates typed operations in `src/generated/`
- **Parallel worktrees**: frontend branch writes `gql` against agreed schema contract; run codegen post-merge when both backend + frontend are on the same branch

### Do NOT

- Import `gql` from `@apollo/client` — use `graphql()` from `src/generated/gql`
- Manually type `useQuery<MyType>` generics — codegen provides exact types
- Edit files in `apps/web/src/generated/` — they are auto-generated
- Redeclare GraphQL enum types locally — import from `src/generated/graphql`

## AI Provider (env-switched `IAiProvider`)

AI is **real**, swapped by environment behind a single abstract DI token `IAiProvider`. The interface and prompts are identical across environments — only the transport differs, so swapping providers never touches handlers, resolvers, or the frontend.

- **DEV (`NODE_ENV=development`)** — `ClaudeCliAiProvider`: spawns `claude -p "<prompt>" --output-format stream-json --model <model>` and relays stdout. In scope, mandatory.
- **NON-DEV** — `AnthropicApiAiProvider`: a streaming Anthropic API session, a drop-in swap for the same `IAiProvider` contract. Architected now; full implementation is out of scope this pass.

The module wires the provider by env: `{ provide: IAiProvider, useClass: NODE_ENV === 'development' ? ClaudeCliAiProvider : AnthropicApiAiProvider }`.

### Shared prompts (A / B / C)

Prompts live once and are reused across providers (`apps/api/src/modules/ai/prompts/`, eval fixtures under `prompts/fixtures/`):
- **Prompt A — PR → feature suggestion** (`suggestFeatureForPr`): classify a merged PR into exactly one candidate feature; STRICT JSON `{ featureId, confidence, rationale }`; matches on each feature's **description**, never invents an id.
- **Prompt B — release client summary** (`generateSummary`): one client-facing summary, grouped by feature **tag**; availability wording **derived strictly** from `FeatureState` + `FlagState` via the locked enum→client-line mapping — never "available" when a flag is off.
- **Prompt C — tone variant**: rewrite a summary in a given tone, keeping every fact and availability wording identical.

### Streaming

`generateSummary` streams to the browser as a **GraphQL subscription over `graphql-ws`** — the provider yields an `AsyncIterable<string>` of tokens, the resolver maps it to a subscription, the frontend consumes it via Apollo's subscription link. Honor `prefers-reduced-motion` in the streaming UI. Non-streamed AI calls (`suggestFeatureForPr`) are plain queries/mutations. Model and tone are inputs (`{ model?, tone? }`) threaded through to `claude -p --model` (DEV) / the API session (non-DEV) and Prompt C.

### Do NOT

- Import a concrete AI provider in a handler — depend on `IAiProvider` only
- Branch on `NODE_ENV` outside the AI module's provider wiring — handlers stay env-agnostic
- Fork the prompts per environment — A/B/C are shared; only the transport differs
- Hand-write the availability line — derive it from state via the §B mapping / shared enum→i18n-key map

## Agents

| Agent | Scope | When to use |
|---|---|---|
| `backend` | NestJS modules, handlers, resolvers, repos | Creating/modifying API features |
| `frontend` | React components, pages, hooks, styling | Creating/modifying UI features |
| `database` | Prisma schema, migrations, seeds, Kysely | Schema changes, query optimization |
| `testing` | Vitest tests across all packages | Writing or running tests |
| `review` | Code review, PR creation, type audits | Before merging, quality checks |

## Skills

### Backend (all available to `backend` agent)
- `nestjs-architecture` — CQRS, vertical slices, IoC, transactional handlers
- `nestjs-best-practices` — NestJS production patterns, DI, security
- `platform-backend` — API design, error handling, validation, logging
- `prisma-client-api` — Prisma CRUD operations, filters, transactions
- `prisma-cli` — Prisma CLI commands reference
- `prisma-database-setup` — Database provider configuration
- `prisma-driver-adapter-implementation` — Driver adapter contracts
- `apollo-skills:apollo-server` — Apollo Server config, plugins, context setup
- `apollo-skills:graphql-schema` — GraphQL schema design best practices

### Frontend (all available to `frontend` agent)
- `nebula-design` — **Nebula visual design language** (dark/electric, indigo→magenta, glass, bold type, pill geometry, Spline/R3F 3D); use for any new screen, page, component, or restyle
- `tech-react` — React components, hooks, rendering patterns
- `react-router-data-mode` — createBrowserRouter, loaders, actions
- `platform-frontend` — State management, data fetching
- `frontend-architecture` — Feature-first structure, CASL patterns
- `design-frontend` — Layout, responsive, Tailwind tokens
- `design-accessibility` — WCAG AA, ARIA, keyboard navigation
- `accessibility` — WCAG 2.2 audit and compliance
- `tailwind-css-patterns` — Utility-first styling patterns
- `frontend-design` — Production-grade UI design quality
- `vercel-react-best-practices` — React/Next.js performance optimization
- `vercel-composition-patterns` — Component composition that scales
- `apollo-skills:apollo-client` — Apollo Client 4.x hooks, caching, auth links
- `apollo-skills:graphql-operations` — Query, mutation, fragment best practices

### Database (all available to `database` agent)
- `prisma-cli` — Prisma CLI commands reference
- `prisma-client-api` — Prisma CRUD operations, filters, transactions
- `prisma-database-setup` — Database provider configuration
- `prisma-driver-adapter-implementation` — Driver adapter contracts
- `prisma-postgres` — Prisma Postgres managed database
- `platform-database` — SQL design, query optimization
- `nestjs-architecture` — Understands downstream API impact of schema changes

### Testing (all available to `testing` agent)
- `tech-vitest` — Vitest utilities, vi.mock, fake timers
- `platform-testing` — Test philosophy, structure, mocking
- `tech-react` — Component testing patterns
- `nestjs-architecture` — Handler testing patterns
- `prisma-client-api` — Repository integration test patterns

### Review (all available to `review` agent)
- `agent-pr-creator` — PR creation via gh CLI
- `type-system-audit` — Type safety audit from bug-fix commits
- `nestjs-architecture` + `nestjs-best-practices` — Backend compliance
- `frontend-architecture` — Frontend compliance
- `nebula-design` — Visual design-language compliance (Nebula tokens, accent discipline, AA contrast)
- `platform-backend` + `platform-frontend` + `platform-database` + `platform-testing` — Full-stack review

### Cross-cutting (available to all agents)
- `lang-typescript` — TypeScript patterns, strict mode, no any
- `typescript-advanced-types` — Generics, conditional types, mapped types
- `core-coding-standards` — KISS, DRY, clean code

### Tooling
- `promptify` — Prompt engineering and improvement

## Commands

```bash
# Development
pnpm dev                          # Start all workspaces
pnpm --filter @release-hub/api dev    # Start API only
pnpm --filter @release-hub/web dev    # Start web only

# Type checking
pnpm -r typecheck                 # All packages
pnpm --filter @release-hub/api typecheck

# Database
prisma generate                   # Regenerate client + Kysely types
prisma migrate dev --name <name>  # Create + apply migration
prisma migrate deploy             # Apply pending migrations (prod)
prisma studio                     # Database GUI
docker compose up -d              # Start PostgreSQL

# Build
pnpm -r build                    # Build all packages
```

## Code Quality (non-negotiable)

- **No `any`** — every value must have an explicit, precise type; never use `any` or cast with `as any`
- **No type bypasses** — no `@ts-ignore`, `@ts-expect-error`, or unsafe casts (`as unknown as X`)
- **No comments** — code must be self-documenting through naming and structure; no inline comments, no block comments, no JSDoc
- **Strict typing everywhere** — function parameters, return types, generics, and object shapes must all be explicitly typed
- **No magic strings** — every domain value (roles, actions, subjects, statuses, etc.) must use an `as const` enum constant; never raw string literals
- **No hardcoded UI text** — all user-facing strings via `useTranslation()` from `react-i18next`; one namespace per feature (e.g. `'dashboard'`, `'settings'`); shared strings in `'common'`
- **KISS & DRY** — no speculative abstractions, no duplicate logic, no dead code
- **shadcn/ui first (non-negotiable)** — every UI change or new component MUST use shadcn/ui primitives; never build custom components from scratch when a shadcn equivalent exists; install missing ones with `pnpm dlx shadcn@latest add <component>`

## Do NOT

- Use Zod — use `class-validator` on `@InputType()`
- Create service classes — use command/query handlers
- Use `@Inject()` string tokens — import directly or use abstract class DI tokens
- Make `tx` optional in repositories — always required
- Declare types inline — use dedicated interface files
- Use `prisma-client-js` generator — use `prisma-client` with `output`
- Use `env()` in `prisma.config.ts` — use `process.env` (it throws when var is missing)
- Import `PrismaClient` from `@prisma/client` — import from `./generated/client/client`
- Use `Pool` with `PrismaPg` — pass connection string directly
- Skip CASL checks in handlers — authorization is mandatory inside every handler
- Use magic strings for CASL — always use `Action.X`, `Subject.Y`, `ProjectRole.X` enums from `@release-hub/shared`
- Add domain types to `packages/shared` — shared only contains CASL; frontend types come from GraphQL codegen
- Put business logic in resolvers — resolvers only dispatch to buses
- Use `any` type — define a proper interface or generic instead
- Add comments — rename or restructure the code to make it clear without them
- Hardcode Spanish/English UI text — always use `t('key')` via `useTranslation()`
- Build UI components from scratch — always check shadcn/ui first; this applies to every frontend change, no exceptions
