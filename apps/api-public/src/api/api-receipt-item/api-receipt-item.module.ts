import { Module } from '@nestjs/common'
import { ApiReceiptItemController } from './api-receipt-item.controller'
import { ApiReceiptItemService } from './api-receipt-item.service'

@Module({
  imports: [],
  controllers: [ApiReceiptItemController],
  providers: [ApiReceiptItemService],
})
export class ApiReceiptItemModule {}
