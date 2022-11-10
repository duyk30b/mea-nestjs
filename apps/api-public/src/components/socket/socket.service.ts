import { Injectable } from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { Server } from 'socket.io'
import { Arrival } from '_libs/database/entities'
import { SOCKET_EVENT } from './socket.variable'

@Injectable()
export class SocketService {
	public connections: Record<string, any[]> = null
	public io: Server = null

	emitArrivalNew(oid: number, arrival: Arrival) {
		this.io
			.in(oid.toString())
			.emit(SOCKET_EVENT.ADMISSION_NEW, instanceToPlain(arrival))
	}
}
