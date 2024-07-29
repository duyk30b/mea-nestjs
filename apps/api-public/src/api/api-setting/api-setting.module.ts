import { Module } from '@nestjs/common'
import { GoogleDriverModule } from '../../../../_libs/transporter/google-driver/google-driver.module'
import { ApiSettingGoogleDriverService } from './api-setting-google-driver.service'
import { ApiSettingController } from './api-setting.controller'
import { ApiSettingService } from './api-setting.service'

@Module({
  imports: [GoogleDriverModule],
  controllers: [ApiSettingController],
  providers: [ApiSettingService, ApiSettingGoogleDriverService],
})
export class ApiSettingModule {}
