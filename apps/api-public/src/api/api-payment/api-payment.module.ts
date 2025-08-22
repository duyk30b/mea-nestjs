import { Module } from '@nestjs/common'
import { ApiPaymentController } from './api-payment.controller'
import { ApiPaymentService } from './api-payment.service'
import { PaymentOtherService } from './payment-other.service'

@Module({
  imports: [],
  controllers: [ApiPaymentController],
  providers: [ApiPaymentService, PaymentOtherService],
})
export class ApiPaymentModule { }
