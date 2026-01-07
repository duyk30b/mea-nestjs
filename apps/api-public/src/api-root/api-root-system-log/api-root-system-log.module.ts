import { Module } from '@nestjs/common'
import { ApiRootSystemLogController } from './api-root-system-log.controller'
import { ApiRootSystemLogService } from './api-root-system-log.service'

@Module({
  imports: [],
  controllers: [ApiRootSystemLogController],
  providers: [ApiRootSystemLogService],
})
export class ApiRootSystemLogModule { }
