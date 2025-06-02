import { Module } from '@nestjs/common'
import { ApiPaymentController } from './api-payment.controller'
import { ApiPaymentService } from './api-payment.service'

@Module({
  imports: [],
  controllers: [ApiPaymentController],
  providers: [ApiPaymentService],
})
export class ApiPaymentModule { }
