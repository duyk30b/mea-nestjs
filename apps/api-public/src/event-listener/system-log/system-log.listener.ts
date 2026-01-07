import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SystemLogRepository } from '../../../../_libs/mongo/collections/system-log/system-log.repository'
import { SystemLogInsertType } from '../../../../_libs/mongo/collections/system-log/system-log.schema'
import { SYSTEM_LOG_EVENT } from './system-log.constants'

@Injectable()
export class SystemLogListener {
  private logger = new Logger(SystemLogListener.name)
  constructor(private readonly systemLogRepository: SystemLogRepository) { }

  @OnEvent(SYSTEM_LOG_EVENT.INSERT)
  async listenSystemLogEventInsert(payload: { data: SystemLogInsertType }) {
    const res = await this.systemLogRepository.insertOne(payload.data)
  }
}
