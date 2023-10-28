import { Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { TransporterConfig } from '../transporter.config'
import { NatsClientService } from './nats-client.service'

@Module({
  imports: [ConfigModule.forFeature(TransporterConfig)],
  providers: [
    {
      provide: 'NATS_CLIENT_SERVICE',
      inject: [TransporterConfig.KEY],
      useFactory: (transporterConfig: ConfigType<typeof TransporterConfig>) => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: transporterConfig.natServers,
            headers: { 'x-version': '1.0.0' },
          },
        })
      },
    },
    NatsClientService,
  ],
  exports: [NatsClientService],
})
export class NatsClientModule {}
