import { Global, Module } from '@nestjs/common'
import { JwtExtendModule } from '../../auth/jwt-extend/jwt-extend.module'
import { SocketGateway } from './socket.gateway'
import { SocketService } from './socket.service'

@Global()
@Module({
  imports: [JwtExtendModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
