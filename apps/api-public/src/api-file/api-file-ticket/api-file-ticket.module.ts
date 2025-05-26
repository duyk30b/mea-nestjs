import { Module } from '@nestjs/common'
import { ApiFileTicketController } from './api-file-ticket.controller'
import { ApiFileTicketDownloadExcel } from './api-file-ticket.download-excel'

@Module({
  imports: [],
  controllers: [ApiFileTicketController],
  providers: [ApiFileTicketDownloadExcel],
})
export class ApiFileTicketModule { }
