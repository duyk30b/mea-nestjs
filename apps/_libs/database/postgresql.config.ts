import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const PostgresqlConfig = registerAs(
  'postgres',
  (): TypeOrmModuleOptions => ({
    type: process.env.SQL_TYPE as 'postgres',
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT),
    database: process.env.SQL_DATABASE,
    username: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV !== 'production' ? 'all' : ['error'],
  })
)
