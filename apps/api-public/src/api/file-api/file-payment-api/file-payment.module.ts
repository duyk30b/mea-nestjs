import { PaymentResource } from '@api-public/resource/payment-resource/payment.resource'
import { Module } from '@nestjs/common'
import { FilePaymentController } from './file-payment.controller'
import { FilePaymentDownloadExcel } from './file-payment.download-excel'

@Module({
  imports: [],
  controllers: [FilePaymentController],
  providers: [PaymentResource, FilePaymentDownloadExcel],
})
export class FilePaymentModule {}
