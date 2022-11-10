import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class TcpClientService {
	constructor(@Inject('TCP_CLIENT_SERVICE') private readonly tcpClient: ClientProxy) { }

	async send(pattern: string, data: any): Promise<any> {
		const request = this.tcpClient.send(pattern, data)
		return await firstValueFrom(request)
	}
}
