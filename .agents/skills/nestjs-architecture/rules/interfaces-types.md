# Interfaces & Types

All domain types live in dedicated interface files. No inline type declarations.

## File Layout

- `interfaces/[domain].interfaces.ts` — domain entity interfaces, data transfer interfaces, filter interfaces
- `interfaces/[entity].repository.interface.ts` — abstract repository class
- `events/[domain].events.ts` — event interfaces extending IDomainEvent
- `common/cqrs/types.ts` — TxClient, IDomainEvent (shared across all modules)
- `common/types/index.ts` — AuthUser (shared across all modules)

## Rules

- Every interface starts with `I` prefix: `IWidget`, `ICreateWidgetData`, `IWidgetFilters`
- Entity interfaces match the Prisma model shape (but are decoupled from it)
- Event interfaces extend `IDomainEvent` from `common/cqrs/types`
- Event classes implement their corresponding interface
- Repository abstract classes use `I` prefix: `IWidgetRepository`
- GraphQL types (`@ObjectType`, `@InputType`) are classes, not interfaces — they live in `types/` and `commands/[action]/`
