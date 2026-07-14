import { GoogleDriverModule } from '@libs/transporter/google-driver/google-driver.module'
import { Global, Module } from '@nestjs/common'
import { ImageManagerService } from './image-manager.service'

@Global()
@Module({
  imports: [GoogleDriverModule],
  providers: [ImageManagerService],
  exports: [ImageManagerService],
})
export class ImageManagerModule {}
