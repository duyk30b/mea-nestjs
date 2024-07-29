import { registerAs } from '@nestjs/config'

export const JwtConfig = registerAs('jwt', () => ({
  accessKey: process.env.JWT_ACCESS_KEY,
  refreshKey: process.env.JWT_REFRESH_KEY,
  accessTime: Number(process.env.JWT_ACCESS_TIME),
  refreshTime: Number(process.env.JWT_REFRESH_TIME),
}))
