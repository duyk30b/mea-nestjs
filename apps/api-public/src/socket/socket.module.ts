import { JwtExtendModule } from '@libs/common/jwt-extend/jwt-extend.module'
import { Global, Module } from '@nestjs/common'
import { SocketEmitService } from './socket-emit.service'
import { SocketController } from './socket.controller'
import { SocketGateway } from './socket.gateway'

@Global()
@Module({
  imports: [JwtExtendModule],
  controllers: [SocketController],
  providers: [SocketGateway, SocketEmitService],
  exports: [SocketEmitService],
})
export class SocketModule {}
