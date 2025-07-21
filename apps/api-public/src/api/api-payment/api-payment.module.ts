import { Module } from '@nestjs/common'
import { ApiPaymentController } from './api-payment.controller'
import { ApiPaymentService } from './api-payment.service'
import { PaymentActionService } from './payment-action.service'

@Module({
  imports: [],
  controllers: [ApiPaymentController],
  providers: [ApiPaymentService, PaymentActionService],
})
export class ApiPaymentModule { }
