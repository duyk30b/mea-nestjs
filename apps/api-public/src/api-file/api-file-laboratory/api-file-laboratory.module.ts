import { Module } from '@nestjs/common'
import { LaboratoryGroupService } from '../../api/master-data/laboratory-group/laboratory-group.service'
import { ApiFileLaboratoryController } from './api-file-laboratory.controller'
import { ApiFileLaboratoryDownloadExcel } from './api-file-laboratory.download-excel'
import { ApiFileLaboratoryUploadExcel } from './api-file-laboratory.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileLaboratoryController],
  providers: [
    ApiFileLaboratoryDownloadExcel,
    ApiFileLaboratoryUploadExcel,
    LaboratoryGroupService,
  ],
})
export class ApiFileLaboratoryModule { }
