import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ClientRedis } from '@nestjs/microservices'
import Redlock, { Settings } from 'redlock'

@Injectable()
export class RedisLockService implements OnModuleInit, OnModuleDestroy {
  private redisLock: any
  constructor(@Inject('REDIS_CLIENT_SERVICE') private redisClient: ClientRedis) {}

  async onModuleInit() {
    try {
      const redis = await this.redisClient.createClient()
      this.redisLock = new Redlock([redis], { retryJitter: 200 })
    } catch (error) {}
  }

  onModuleDestroy() {
    // this.redisClient.close()
  }

  async acquire(keys: string[], duration: number, settings?: Partial<Settings>) {
    return await this.redisLock.acquire(keys, duration, settings)
  }
}
