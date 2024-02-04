import { registerAs } from '@nestjs/config'

export const GlobalConfig = registerAs('global', () => ({
  NODE_VERSION: process.versions.node,
  NODE_ENV: process.env.NODE_ENV,
  DOMAIN: process.env.DOMAIN,
  API_PUBLIC_HOST: process.env.API_PUBLIC_HOST || 'localhost',
  API_PUBLIC_PORT: Number(process.env.API_PUBLIC_PORT || 20000),
  SQL_TYPE: process.env.SQL_TYPE,
  SQL_HOST: process.env.SQL_HOST,
  SQL_PORT: process.env.SQL_PORT,
  SQL_DATABASE: process.env.SQL_DATABASE,
}))

export const JwtConfig = registerAs('jwt', () => ({
  accessKey: process.env.JWT_ACCESS_KEY,
  refreshKey: process.env.JWT_REFRESH_KEY,
  accessTime: Number(process.env.JWT_ACCESS_TIME),
  refreshTime: Number(process.env.JWT_REFRESH_TIME),
}))

export const EmailConfig = registerAs('email', () => ({
  name: process.env.EMAIL_NAME || 'medihome',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: +process.env.EMAIL_PORT || 465,
  user: process.env.EMAIL_USER || 'medihome.vn@gmail.com',
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_ADDRESS || 'medihome.vn@gmail.com',
  subject_prefix: process.env.EMAIL_SUBJECT_PREFIX || '【medihome】',
}))
