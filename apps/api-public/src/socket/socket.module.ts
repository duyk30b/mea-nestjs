import { Global, Module } from '@nestjs/common'
import { JwtExtendModule } from '../auth/jwt-extend/jwt-extend.module'
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
