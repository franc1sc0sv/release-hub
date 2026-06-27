# Release Hub

Turbo + pnpm monorepo skeleton: React 19 (Vite) frontend, NestJS GraphQL (code-first, CQRS) API, and a Prisma 7 + Kysely database layer, with CASL authorization shared across both ends.

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture rules and conventions.

## Workspaces

| Workspace | Stack |
|---|---|
| `apps/web` | React 19, Vite, Tailwind v4, shadcn/ui, React Router v7, Apollo Client + GraphQL Codegen, CASL, i18next |
| `apps/api` | NestJS 10, Apollo Server (code-first), `@nestjs/cqrs`, Passport JWT, class-validator, CASL, Kysely |
| `packages/db` | Prisma 7 (`prisma-client` generator), `@prisma/adapter-pg`, Kysely (`prisma-kysely` types) |
| `packages/shared` | CASL `UserRole` / `Action` / `Subject` enums + `defineAbilityFor()` |

The API ships one reference vertical slice (`auth`: email/password + email-code login, refresh, `me`) and the common CQRS/database/events/guards/mail infrastructure. The web ships the app shell, auth feature, and a placeholder dashboard.

## Prerequisites

- Node 20+
- pnpm 10 (`corepack enable`)
- Docker (for local Postgres + Mailpit)

## Setup

```bash
pnpm install                 # also runs `prisma generate`
docker compose up -d         # Postgres on :5432, Mailpit on :8025
```

Create **`.env`** in the repo root (used by the API):

```dotenv
DATABASE_URL=postgresql://release-hub:release-hub@localhost:5432/release-hub
JWT_SECRET=change-me-in-production
PORT=3001
CORS_ORIGIN=http://localhost:5173

MAIL_FROM=no-reply@release-hub.dev
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false

OTP_CODE_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_MAX_CODES_PER_HOUR=5
OTP_RESEND_COOLDOWN_SECONDS=60
```

Create **`packages/db/.env`** (used by Prisma CLI — migrate/seed):

```dotenv
DATABASE_URL=postgresql://release-hub:release-hub@localhost:5432/release-hub
```

Then apply the schema and seed:

```bash
pnpm db:migrate              # creates the initial migration + tables
pnpm db:seed                 # seeds admin@release-hub.dev / user@release-hub.dev
```

Seeded credentials: `admin@release-hub.dev` / `Admin123!` and `user@release-hub.dev` / `User123!`.

## Develop

```bash
pnpm dev                     # all workspaces (api on :3001, web on :5173)
pnpm --filter @release-hub/api dev
pnpm --filter @release-hub/web dev
```

After changing API GraphQL types, regenerate the frontend operations:

```bash
pnpm --filter @release-hub/web generate
```

## Verify

```bash
pnpm typecheck               # all workspaces
pnpm build                   # all workspaces
```
