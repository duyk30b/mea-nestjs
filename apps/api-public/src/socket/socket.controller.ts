import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../_libs/common/request/external.request'
import { IsRoot } from '../guards/root.guard'
import { SocketEmitService } from './socket-emit.service'

@Controller('socket')
@ApiTags('Socket')
@ApiBearerAuth('access-token')
export class SocketController {
  constructor(private readonly socketEmitService: SocketEmitService) {}

  @Get('server-emit-demo')
  async serverEmitDemo(@External() { oid }: TExternal) {
    this.socketEmitService.demo(oid)
  }
}
