import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { CacheManagerService } from './cache-manager.service'
import { CacheTokenService } from './cache-token.service'

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [CacheManagerService, CacheTokenService],
  exports: [CacheManagerService, CacheTokenService],
})
export class CacheManagerModule {}
