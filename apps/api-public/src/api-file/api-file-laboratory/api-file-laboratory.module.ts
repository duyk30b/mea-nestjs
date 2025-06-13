import { Module } from '@nestjs/common'
import { ApiLaboratoryGroupService } from '../../api/api-laboratory-group/api-laboratory-group.service'
import { ApiFileLaboratoryController } from './api-file-laboratory.controller'
import { ApiFileLaboratoryDownloadExcel } from './api-file-laboratory.download-excel'
import { ApiFileLaboratoryUploadExcel } from './api-file-laboratory.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileLaboratoryController],
  providers: [
    ApiFileLaboratoryDownloadExcel,
    ApiFileLaboratoryUploadExcel,
    ApiLaboratoryGroupService,
  ],
})
export class ApiFileLaboratoryModule { }
