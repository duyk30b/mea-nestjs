import { Module } from '@nestjs/common'
import { ApiProductGroupService } from '../../api/api-product-group/api-product-group.service'
import { ApiFileProductController } from './api-file-product.controller'
import { ApiFileProductDownloadExcel } from './api-file-product.download-excel'
import { ApiFileProductUploadExcel } from './api-file-product.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileProductController],
  providers: [ApiFileProductDownloadExcel, ApiFileProductUploadExcel, ApiProductGroupService],
})
export class ApiFileProductModule { }
