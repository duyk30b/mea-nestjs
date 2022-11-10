import { registerAs } from '@nestjs/config'

export const RedisConfig = registerAs('redis', () => ({
	host: process.env.REDIS_HOST || 'localhost',
	password: process.env.REDIS_PASSWORD || '',
	port: +process.env.REDIS_PORT || 6379,
	db: process.env.REDIS_DB || '0',
}))
