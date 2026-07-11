import { Module } from '@nestjs/common'
import { PrintSettingController } from './print-setting.controller'
import { PrintSettingService } from './print-setting.service'

@Module({
  imports: [],
  controllers: [PrintSettingController],
  providers: [PrintSettingService],
})
export class PrintSettingModule { }
