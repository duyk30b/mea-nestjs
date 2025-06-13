import { Module } from '@nestjs/common'
import { ApiRadiologyGroupService } from '../../api/api-radiology-group/api-radiology-group.service'
import { ApiFileRadiologyController } from './api-file-radiology.controller'
import { ApiFileRadiologyDownloadExcel } from './api-file-radiology.download-excel'
import { ApiFileRadiologyUploadExcel } from './api-file-radiology.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileRadiologyController],
  providers: [ApiFileRadiologyDownloadExcel, ApiFileRadiologyUploadExcel, ApiRadiologyGroupService],
})
export class ApiFileRadiologyModule { }
