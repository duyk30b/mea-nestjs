import { Module } from '@nestjs/common'
import { ApiPaymentItemController } from './api-payment-item.controller'
import { ApiPaymentItemService } from './api-payment-item.service'

@Module({
  imports: [],
  controllers: [ApiPaymentItemController],
  providers: [ApiPaymentItemService],
})
export class ApiPaymentItemModule { }
