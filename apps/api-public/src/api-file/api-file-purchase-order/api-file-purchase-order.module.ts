import { Module } from '@nestjs/common'
import { ApiFileProductDownloadExcel } from '../api-file-product/api-file-product.download-excel'
import { ApiFilePurchaseOrderController } from './api-file-purchase-order.controller'
import { ApiFilePurchaseOrderUploadExcel } from './api-file-purchase-order.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFilePurchaseOrderController],
  providers: [ApiFilePurchaseOrderUploadExcel, ApiFileProductDownloadExcel],
})
export class ApiFilePurchaseOrderModule { }
