import { Global, Module } from '@nestjs/common'
import { RedisModule } from '../../transporter/redis/redis.module'
import { CacheDataService } from './cache-data.service'
import { CacheTokenService } from './cache-token.service'

@Global()
@Module({
  imports: [RedisModule],
  providers: [CacheDataService, CacheTokenService],
  exports: [CacheDataService, CacheTokenService],
})
export class CacheDataModule { }
