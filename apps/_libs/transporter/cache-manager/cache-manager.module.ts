import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { CacheDataService } from './cache-data.service'
import { CacheManagerService } from './cache-manager.service'
import { CacheTokenService } from './cache-token.service'

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [CacheManagerService, CacheTokenService, CacheDataService],
  exports: [CacheManagerService, CacheDataService, CacheTokenService],
})
export class CacheManagerModule {}
