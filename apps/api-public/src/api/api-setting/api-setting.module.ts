import { GoogleDriverModule } from '@libs/transporter/google-driver/google-driver.module'
import { Module } from '@nestjs/common'
import { ApiSettingGoogleDriverService } from './api-setting-google-driver.service'
import { ApiSettingController } from './api-setting.controller'
import { ApiSettingService } from './api-setting.service'

@Module({
  imports: [GoogleDriverModule],
  controllers: [ApiSettingController],
  providers: [ApiSettingService, ApiSettingGoogleDriverService],
})
export class ApiSettingModule {}
