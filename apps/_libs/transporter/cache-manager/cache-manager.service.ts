import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string) {
    const value = await this.cacheManager.get(key)
    return value
  }

  async set(key: string, value: string, ttl = 0) {
    await this.cacheManager.set(key, value, ttl)
  }

  async del(key: string) {
    await this.cacheManager.del(key)
  }

  async reset() {
    await this.cacheManager.reset()
  }

  // pattern: example: '*' + email + '*'
  async keys(pattern?: string) {
    const keys = await this.cacheManager.store.keys(pattern)
    return keys
  }

  async multiple(keys: string[]) {
    const data: { [key: string]: any } = {}
    for (const key of keys) {
      data[key] = await this.cacheManager.get(key)
    }
    return data
  }
}
