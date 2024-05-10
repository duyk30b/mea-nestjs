import { Injectable, Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { getClientIp } from 'request-ip'
import { Server, Socket } from 'socket.io'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { JwtExtendService } from '../../auth/jwt-extend/jwt-extend.service'
import { SocketService } from './socket.service'
import { SOCKET_EVENT } from './socket.variable'

@WebSocketGateway({ cors: { origin: '*' }, transports: ['websocket'] })
@Injectable()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name)

  public connections: Record<string, any[]> = {}

  @WebSocketServer()
  io: Server

  constructor(
    private readonly socketService: SocketService,
    private readonly jwtExtendService: JwtExtendService,
    private readonly employeeRepository: UserRepository
  ) {}

  afterInit(io: Server) {
    this.socketService.io = io
    this.socketService.connections = this.connections
    this.logger.debug('SocketGateway Init')
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    const { token } = socket.handshake.auth
    const ip = getClientIp(socket.client.request)
    try {
      const { oid, uid } = this.jwtExtendService.verifyRefreshToken(token, ip)
      socket.data.user = await this.employeeRepository.findOneBy({ oid, id: uid })
      socket.join(oid.toString())
      this.connections[uid] ||= []
      this.connections[uid].push(socket.id)
      this.logger.log(
        `IP ${ip} UserId ${uid} with socketId ${socket.id} connected, join room ${oid}`
      )
    } catch (error) {
      this.logger.warn(
        `IP ${ip} with SocketId ${socket.id} has invalid token. ERROR: ${error.message}`
      )
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    const uid = socket.data.user?.id
    this.connections[uid] = this.connections[uid]?.filter((i) => i !== socket.id)
    this.logger.log(`UserId ${socket.data.user?.id} with socketId ${socket.id} disconnected`)
  }

  @SubscribeMessage(SOCKET_EVENT.ADMISSION_CREATE)
  async arrivalCreate(socket: Socket, data: any): Promise<any> {
    this.io
      .in(socket.data.user.oid.toString())
      .emit(SOCKET_EVENT.ADMISSION_NEW, `${data}, ${Date.now()}`)
    return Date.now()
  }
}

// https://stackoverflow.com/questions/35680565/sending-message-to-specific-client-in-socket-io
// // sending to sender-client only
// socket.emit('message', "this is a test");
//
// // sending to all clients, include sender
// io.emit('message', "this is a test");
//
// // sending to all clients except sender
// socket.broadcast.emit('message', "this is a test");
//
// // sending to all clients in 'game' room(channel) except sender
// socket.broadcast.to('game').emit('message', 'nice game');
//
// // sending to all clients in 'game' room(channel), include sender
// io.in('game').emit('message', 'cool game');
//
// // sending to sender client, only if they are in 'game' room(channel)
// socket.to('game').emit('message', 'enjoy the game');
//
// // sending to all clients in namespace 'myNamespace', include sender
// io.of('myNamespace').emit('message', 'gg');
//
// // sending to individual socketId
// socket.broadcast.to(socketId).emit('message', 'for your eyes only');

// https://stackoverflow.com/questions/50602359/how-to-send-multiple-client-using-socket-id-that-are-connected-to-socket-nodejs
// Add socket to room
// socket.join('some room');
//
// // Remove socket from room
//     socket.leave('some room');
//
// // Send to current client
//     socket.emit('message', 'this is a test');
//
// // Send to all clients include sender
//     io.sockets.emit('message', 'this is a test');
//
// // Send to all clients except sender
//     socket.broadcast.emit('message', 'this is a test');
//
// // Send to all clients in 'game' room(channel) except sender
//     socket.broadcast.to('game').emit('message', 'this is a test');
//
// // Send to all clients in 'game' room(channel) include sender
//     io.sockets.in('game').emit('message', 'this is a test');
//
// // Send to individual socket id
//     io.sockets.socket(socketId).emit('message', 'this is a test');
