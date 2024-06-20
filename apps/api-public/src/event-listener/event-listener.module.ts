import { Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { VisitEventEmit } from './visit-event/visit-event.emit'
import { VisitEventListener } from './visit-event/visit-event.listener'

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [],
  providers: [VisitEventEmit, VisitEventListener],
  exports: [VisitEventEmit],
})
export class EventListenerModule {}
