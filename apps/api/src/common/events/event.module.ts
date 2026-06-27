import { Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { IEventEmitter } from './event-emitter.abstract'
import { NestEventEmitter } from './event-emitter.service'

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    { provide: IEventEmitter, useClass: NestEventEmitter },
  ],
  exports: [IEventEmitter],
})
export class EventModule {}
