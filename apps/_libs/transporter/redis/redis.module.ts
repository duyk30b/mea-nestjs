import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RedisConfig } from './redis.config'
import { RedisController } from './redis.controller'
import { RedisService } from './redis.service'

@Global()
@Module({
  imports: [ConfigModule.forFeature(RedisConfig)],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
}
