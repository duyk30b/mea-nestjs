import { PaymentResource } from '@api-public/resource/payment-resource/payment.resource'
import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentResource, PaymentService],
})
export class PaymentModule {}
