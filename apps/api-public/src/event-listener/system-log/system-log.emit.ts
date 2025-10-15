import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SystemLogInsertType } from '../../../../_libs/mongo/collections/system-log/system-log.schema'
import { SYSTEM_LOG_EVENT } from './system-log.constants'

@Injectable()
export class SystemLogEmit {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  async emitSystemLogInsert(payload: { data: SystemLogInsertType }) {
    this.eventEmitter.emit(SYSTEM_LOG_EVENT.INSERT, payload)
  }
}
