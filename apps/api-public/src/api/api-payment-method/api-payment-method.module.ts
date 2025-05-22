import { Module } from '@nestjs/common'
import { ApiPaymentMethodController } from './api-payment-method.controller'
import { ApiPaymentMethodService } from './api-payment-method.service'

@Module({
  imports: [],
  controllers: [ApiPaymentMethodController],
  providers: [ApiPaymentMethodService],
})
export class ApiPaymentMethodModule { }
