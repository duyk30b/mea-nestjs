import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { TcpClientService } from './tcp-client.service'
import { TransporterConfig } from '../transporter.config'

@Module({})
export class TcpClientModule {
	static register(serviceName: string): DynamicModule {
		return {
			module: TcpClientModule,
			imports: [ConfigModule.forFeature(TransporterConfig)],
			providers: [
				{
					provide: 'TCP_CLIENT_SERVICE',
					inject: [TransporterConfig.KEY],
					useFactory: (transporterConfig: ConfigType<typeof TransporterConfig>) => {
						return ClientProxyFactory.create({
							transport: Transport.TCP,
							options: {
								port: transporterConfig.tcpServers[serviceName].port,
								host: transporterConfig.tcpServers[serviceName].host,
							},
						})
					},
				},
				TcpClientService,
			],
			exports: [TcpClientService],
		}
	}
}
