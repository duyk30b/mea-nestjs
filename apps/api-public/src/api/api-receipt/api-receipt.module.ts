import { Module } from '@nestjs/common'
import { ApiReceiptAction } from './api-receipt.action'
import { ApiReceiptController } from './api-receipt.controller'
import { ApiReceiptService } from './api-receipt.service'

@Module({
  imports: [],
  controllers: [ApiReceiptController],
  providers: [ApiReceiptService, ApiReceiptAction],
})
export class ApiReceiptModule { }
