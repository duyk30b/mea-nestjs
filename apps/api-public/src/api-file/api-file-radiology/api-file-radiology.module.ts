import { Module } from '@nestjs/common'
import { RadiologyGroupService } from '../../api/master-data/radiology-group/radiology-group.service'
import { ApiFileRadiologyController } from './api-file-radiology.controller'
import { ApiFileRadiologyDownloadExcel } from './api-file-radiology.download-excel'
import { ApiFileRadiologyUploadExcel } from './api-file-radiology.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileRadiologyController],
  providers: [ApiFileRadiologyDownloadExcel, ApiFileRadiologyUploadExcel, RadiologyGroupService],
})
export class ApiFileRadiologyModule { }
