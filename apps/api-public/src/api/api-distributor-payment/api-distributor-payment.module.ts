import { Module } from '@nestjs/common'
import { ApiDistributorPaymentController } from './api-distributor-payment.controller'
import { ApiDistributorPaymentService } from './api-distributor-payment.service'

@Module({
  imports: [],
  controllers: [ApiDistributorPaymentController],
  providers: [ApiDistributorPaymentService],
})
export class ApiDistributorPaymentModule {}
