import { Inject, Injectable } from '@nestjs/common'
import { ConfigType, registerAs } from '@nestjs/config'
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'

export const MongoDbConfig = registerAs('mongodb', () => ({
  type: 'mongodb',
  host: process.env.MONGO_HOST,
  port: parseInt(process.env.MONGO_PORT),
  dbName: process.env.MONGO_DATABASE_NAME,
  username: process.env.MONGO_USERNAME,
  password: process.env.MONGO_PASSWORD,
  authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
  logging: process.env.NODE_ENV === 'local',
}))

@Injectable()
export default class MongodbConfigService implements MongooseOptionsFactory {
  constructor(@Inject(MongoDbConfig.KEY) private mongoDbConfig: ConfigType<typeof MongoDbConfig>) { }

  createMongooseOptions(): MongooseModuleOptions {
    const { username, password, host, port, dbName, authSource, logging } = this.mongoDbConfig
    const mongoDbUri = `mongodb://${username}:${password}@${host}:${port}/?authSource=${authSource}`

    mongoose.set('debug', logging)
    mongoose.set('toObject', { virtuals: true })
    mongoose.set('toJSON', { virtuals: true })
    return {
      uri: mongoDbUri,
      dbName,
      onConnectionCreate: (connection: mongoose.Connection) => {
        connection.on('connected', () => console.log('MongoDB connected'))
        connection.on('open', () => console.log('MongoDB open'))
        connection.on('disconnected', () => console.log('MongoDB disconnected'))
        connection.on('reconnected', () => console.log('MongoDB reconnected'))
        connection.on('disconnecting', () => console.log('MongoDB disconnecting'))

        return connection
      },
    }
  }
}
