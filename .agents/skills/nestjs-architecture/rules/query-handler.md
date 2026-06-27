# Query Handler

Queries represent read operations. Every query handler extends `BaseQueryHandler`.

## BaseQueryHandler (in `common/cqrs/`)

```typescript
export abstract class BaseQueryHandler<TQuery, TResult>
  implements IQueryHandler<TQuery, TResult>
{
  constructor(protected readonly db: IDatabaseService) {}

  async execute(query: TQuery): Promise<TResult> {
    return this.db.$transaction((tx) => this.handle(query, tx))
  }

  protected abstract handle(query: TQuery, tx: TxClient): Promise<TResult>
}
```

## Rules

- Every query handler uses `@QueryHandler(XQuery)` decorator
- Queries are always transactional (consistent reads)
- No events in queries — read-only operations
- `handle()` receives `tx` and passes it to repository methods
- For complex queries, use Kysely query builders from `@release-hub/db`
- Constructor calls `super(db)` then adds module-specific deps

## Query Class

```typescript
export class ListWidgetsQuery {
  constructor(public readonly filters: IWidgetFilters) {}
}
```

## Kysely for Complex Reads

When Prisma's query API is insufficient, use Kysely:

```typescript
import { kysely } from '@release-hub/db'

const query = kysely
  .selectFrom('widgets')
  .innerJoin('users', 'users.id', 'widgets.owner_id')
  .where('widgets.deleted_at', 'is', null)
  .select(['widgets.id', 'widgets.name', 'users.name as owner_name'])
  .compile()

const result = await tx.$queryRawUnsafe(query.sql, ...query.parameters)
```
