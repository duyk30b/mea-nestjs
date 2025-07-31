import * as dotenv from 'dotenv'
import * as path from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.resolve(__dirname, `../../../../.env.${process.env.NODE_ENV}`),
  })
}
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const options: DataSourceOptions = {
  type: (process.env.SQL_TYPE || 'mariadb' || 'postgres') as any,
  host: process.env.SQL_HOST || 'localhost',
  port: Number(process.env.SQL_PORT) || 7106,
  database: process.env.SQL_DATABASE,
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  entities: [path.resolve(__dirname, '../entities/*.entity.{ts,js}')],
  migrations: [path.resolve(__dirname, '../migrations/*.{ts,js}')],
  migrationsTableName: 'typeorm_migration',
  migrationsTransactionMode: 'each',
  logging: true,
}

export const dataSource = new DataSource(options)
