# Domain Events

Events are emitted after a transaction commits. They follow an interface + class pattern.

## Event Interface (in `events/[domain].events.ts`)

```typescript
import { IDomainEvent } from '@/common/cqrs/types'

export interface IWidgetCreatedEvent extends IDomainEvent {
  widgetId: string
  ownerId: string
}
```

## Event Class (in `events/[action]-[entity].event.ts`)

```typescript
export class WidgetCreatedEvent implements IWidgetCreatedEvent {
  readonly eventName = 'WidgetCreatedEvent'
  readonly occurredAt: Date
  readonly widgetId: string
  readonly ownerId: string

  constructor(props: { widgetId: string; ownerId: string }) {
    this.widgetId = props.widgetId
    this.ownerId = props.ownerId
    this.occurredAt = new Date()
  }
}
```

## Rules

- All events implement `IDomainEvent` (requires `eventName` and `occurredAt`)
- `eventName` matches the class name (used for routing)
- Events are collected in the `events` array during `handle()`, emitted after tx commits
- Event interfaces live in `events/[domain].events.ts`
- Event classes live in `events/[action]-[entity].event.ts`
- Constructor takes a props object — no positional arguments
- Events are immutable — all fields are `readonly`
- Listeners use `@OnEvent('WidgetCreatedEvent')` decorator from `@nestjs/event-emitter`
