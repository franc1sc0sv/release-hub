import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { IDomainEvent } from '../cqrs/types'
import { IEventEmitter } from './event-emitter.abstract'

@Injectable()
export class NestEventEmitter extends IEventEmitter {
  private readonly emitter: EventEmitter2

  constructor(emitter: EventEmitter2) {
    super()
    this.emitter = emitter
  }

  emit(eventName: string, event: IDomainEvent): void {
    this.emitter.emit(eventName, event)
  }
}
