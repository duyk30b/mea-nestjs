import { registerAs } from '@nestjs/config'

export const TransporterConfig = registerAs('transporter', () => ({
  natServers: process.env.NAT_SERVERS?.split(',') || ['nats://nats:4222'],
  tcpServers: {
    userService: {
      port: Number(process.env.USER_SERVICE_PORT) || 3000,
      host: process.env.USER_SERVICE_HOST || 'user-service',
    },
  },
}))
