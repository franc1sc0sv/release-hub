import type { IDomainEvent } from '../cqrs/types'

export abstract class IEventEmitter {
  abstract emit(eventName: string, event: IDomainEvent): void
}
