import { Module } from '@nestjs/common'
import { ApiPaymentActionService } from './api-payment-action.service'
import { ApiPaymentController } from './api-payment.controller'
import { ApiPaymentService } from './api-payment.service'

@Module({
  imports: [],
  controllers: [ApiPaymentController],
  providers: [ApiPaymentService, ApiPaymentActionService],
})
export class ApiPaymentModule { }
