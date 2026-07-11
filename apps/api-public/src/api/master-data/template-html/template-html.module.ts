import { Module } from '@nestjs/common'
import { TemplateHtmlController } from './template-html.controller'
import { TemplateHtmlService } from './template-html.service'

@Module({
  imports: [],
  controllers: [TemplateHtmlController],
  providers: [TemplateHtmlService],
})
export class TemplateHtmlModule { }
