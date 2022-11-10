import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const GlobalConfig = registerAs('global', () => ({ domain: process.env.DOMAIN }))

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
