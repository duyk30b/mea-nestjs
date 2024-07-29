import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { RedisClientType, createClient } from 'redis'
import { RedisConfig } from './redis.config'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private redisClient: RedisClientType

  constructor(
    @Inject(RedisConfig.KEY)
    private redisConfig: ConfigType<typeof RedisConfig>
  ) { }

  async onModuleInit() {
    try {
      this.redisClient = createClient({
        url: `redis://${this.redisConfig.host}:${this.redisConfig.port}`,
        password: this.redisConfig.password,
      })
      await this.redisClient.connect()
      this.logger.log('Redis connection established')
    } catch (error) {
      this.logger.error('Redis connection error', error)
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit()
    }
  }

  async get(key: string): Promise<string> {
    try {
      return await this.redisClient.get(key)
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error)
      throw error
    }
  }

  async getKeys(pattern: string) {
    const keys: string[] = []
    let cursor = 0
    do {
      const scanResult = await this.redisClient.scan(cursor, { MATCH: pattern, COUNT: 1 })
      cursor = scanResult.cursor
      keys.push(...scanResult.keys)
    } while (cursor !== 0) // Continue scanning until the cursor is back to 0
    return keys
  }

  async set(
    key: string,
    value: string,
    TTL?: { milliseconds: number; datetime?: never } | { milliseconds?: never; datetime: Date }
  ) {
    try {
      const a = new Date()
      if (TTL && TTL.milliseconds) {
        await this.redisClient.set(key, value, { PX: TTL.milliseconds })
      } else if (TTL && TTL.datetime) {
        await this.redisClient.set(key, value, { PXAT: TTL.datetime.getTime() })
      } else {
        await this.redisClient.set(key, value)
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error)
      throw error
    }
  }

  async del(key: string) {
    try {
      await this.redisClient.del(key)
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error)
      throw error
    }
  }
}
