import { Module } from '@nestjs/common'
import { ApiFileProductModule } from './api-file-product/api-file-product.module'
import { ApiFileReceiptModule } from './api-file-receipt/api-file-receipt.module'

@Module({
  imports: [ApiFileProductModule, ApiFileReceiptModule],
  controllers: [],
  providers: [],
})
export class ApiFileModule { }
