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
- `UserRole`, `Action`, `Subject` — `as const` enum objects (never use magic strings)
- `defineAbilityFor(role: UserRole)` — builds a CASL `AppAbility` from a role

**Backend enforcement (apps/api):**
1. `PoliciesGuard` (route-level) — reads `user.role` from JWT, calls `defineAbilityFor(role)`, checks `@Can()` decorator
2. Handler (resource-level) — calls `defineAbilityFor(role)`, checks `ability.can(Action.X, Subject.Y)`, throws `ForbiddenException`
3. Both layers are mandatory — guard = coarse role gate, handler = fine-grained + future ownership checks

**Frontend rendering (apps/web):**
1. `AbilityProvider` — calls `defineAbilityFor(role)` from JWT, pushes ability into React context
2. `<Can I={Action.X} a={Subject.Y}>` — conditionally renders UI elements (nav items, buttons)
3. `RequireAbility` — route-level guard, redirects to `/dashboard` if denied

**Adding a new permission (checklist):**
1. `packages/shared/src/casl.ts` — add enum value to `Action`/`Subject` if new, add `can()` rule to relevant roles
2. `apps/api` — add `@Can(Action.X, Subject.Y)` on resolver + `ability.can()` check inside handler
3. `apps/web` — wrap UI element with `<Can I={Action.X} a={Subject.Y}>` or add `RequireAbility` route guard
4. Always use enum values (`Action.CREATE`, `Subject.USER`) — never raw strings

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
- Use magic strings for CASL — always use `Action.X`, `Subject.Y`, `UserRole.X` enums from `@release-hub/shared`
- Import `UserRole` from `@release-hub/db/enums` — import from `@release-hub/shared` (single source of truth)
- Add domain types to `packages/shared` — shared only contains CASL; frontend types come from GraphQL codegen
- Put business logic in resolvers — resolvers only dispatch to buses
- Use `any` type — define a proper interface or generic instead
- Add comments — rename or restructure the code to make it clear without them
- Hardcode Spanish/English UI text — always use `t('key')` via `useTranslation()`
- Build UI components from scratch — always check shadcn/ui first; this applies to every frontend change, no exceptions
