import { Module } from '@nestjs/common'
import { ApiPrintHtmlSettingController } from './api-print-html-setting.controller'
import { ApiPrintHtmlSettingService } from './api-print-html-setting.service'

@Module({
  imports: [],
  controllers: [ApiPrintHtmlSettingController],
  providers: [ApiPrintHtmlSettingService],
})
export class ApiPrintHtmlSettingModule { }
