# CASL Policy

Authorization is checked inside command/query handlers using CASL from `@release-hub/shared`.

## Pattern

```typescript
import { defineAbilityFor } from '@release-hub/shared'
import { ForbiddenException } from '@/common/errors'

// Inside handler.handle()
const actor = await tx.user.findUniqueOrThrow({ where: { id: cmd.actorId } })
const ability = defineAbilityFor(actor.role)
if (!ability.can('create', 'Widget')) throw new ForbiddenException()
```

## Rules

- `defineAbilityFor(role)` is the single source of truth (in `packages/shared/src/casl.ts`)
- Authorization always happens inside the handler, not only in guards
- Guards (`JwtAuthGuard`) handle authentication — is the user logged in?
- Handlers handle authorization — can this user do this action?
- For entity-level checks (e.g., "can user edit THIS widget"), use `ability.can('update', subject('Widget', widget))`
- Throw `ForbiddenException` from `common/errors/` (extends GraphQLError)
- The actor's role is fetched from DB inside the transaction for consistency
