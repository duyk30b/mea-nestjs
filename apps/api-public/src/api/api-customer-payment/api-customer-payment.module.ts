import { Module } from '@nestjs/common'
import { ApiCustomerPaymentController } from './api-customer-payment.controller'
import { ApiCustomerPaymentService } from './api-customer-payment.service'

@Module({
  imports: [],
  controllers: [ApiCustomerPaymentController],
  providers: [ApiCustomerPaymentService],
})
export class ApiCustomerPaymentModule {}
