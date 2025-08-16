import { Module } from '@nestjs/common'
import { ApiPaymentController } from './api-payment.controller'
import { ApiPaymentService } from './api-payment.service'
import { PaymentCustomerService } from './payment-customer.service'
import { PaymentDistributorService } from './payment-distributor.service'
import { PaymentOtherService } from './payment-other.service'

@Module({
  imports: [],
  controllers: [ApiPaymentController],
  providers: [
    ApiPaymentService,
    PaymentCustomerService,
    PaymentDistributorService,
    PaymentOtherService,
  ],
})
export class ApiPaymentModule { }
