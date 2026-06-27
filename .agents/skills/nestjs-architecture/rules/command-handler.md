# Command Handler

Commands represent write operations. Every command handler extends `BaseCommandHandler`.

## BaseCommandHandler (in `common/cqrs/`)

```typescript
export abstract class BaseCommandHandler<TCommand, TResult = void>
  implements ICommandHandler<TCommand, TResult>
{
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(command: TCommand): Promise<TResult> {
    const events: IDomainEvent[] = []
    const result = await this.db.$transaction((tx) =>
      this.handle(command, tx, events),
    )
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event)
    }
    return result
  }

  protected abstract handle(
    command: TCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<TResult>
}
```

## Rules

- Every command handler uses `@CommandHandler(XCommand)` decorator
- `handle()` receives `tx` (transaction client) and `events` array
- All DB writes go through `tx` — passed to repository methods
- CASL authorization check happens at the start of `handle()`
- Domain events are pushed to `events` array — emitted AFTER transaction commits
- Input is already validated by `ValidationPipe` — no re-validation in handler
- Constructor calls `super(db, eventEmitter)` then adds module-specific deps

## Command Class

```typescript
export class CreateWidgetCommand {
  constructor(
    public readonly input: CreateWidgetInput,
    public readonly actorId: string,
  ) {}
}
```

Commands carry the validated input + the actor ID. Nothing else.
