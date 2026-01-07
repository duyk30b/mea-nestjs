import { Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { SystemLogEmit } from './system-log/system-log.emit'
import { SystemLogListener } from './system-log/system-log.listener'

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [],
  providers: [SystemLogEmit, SystemLogListener],
  exports: [SystemLogEmit],
})
export class EventListenerModule { }
