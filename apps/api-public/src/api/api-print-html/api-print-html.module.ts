import { Module } from '@nestjs/common'
import { ApiPrintHtmlController } from './api-print-html.controller'
import { ApiPrintHtmlService } from './api-print-html.service'

@Module({
  imports: [],
  controllers: [ApiPrintHtmlController],
  providers: [ApiPrintHtmlService],
})
export class ApiPrintHtmlModule { }
