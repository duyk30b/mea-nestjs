import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GoogleDriverConfig } from './google-driver.config'
import { GoogleDriverService } from './google-driver.service'

@Module({
  imports: [ConfigModule.forFeature(GoogleDriverConfig)],
  controllers: [],
  providers: [GoogleDriverService],
  exports: [GoogleDriverService],
})
export class GoogleDriverModule {}
