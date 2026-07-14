import { Module } from '@nestjs/common'
import { ProductGroupService } from '../../api/master-data/product_group/product-group.service'
import { ApiFileProductController } from './api-file-product.controller'
import { ApiFileProductDownloadExcel } from './api-file-product.download-excel'
import { ApiFileProductUploadExcel } from './api-file-product.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileProductController],
  providers: [ApiFileProductDownloadExcel, ApiFileProductUploadExcel, ProductGroupService],
})
export class ApiFileProductModule { }
