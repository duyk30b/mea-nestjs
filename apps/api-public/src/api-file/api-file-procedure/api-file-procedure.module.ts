import { Module } from '@nestjs/common'
import { ApiProcedureGroupService } from '../../api/api-procedure-group/api-procedure-group.service'
import { ApiFileProcedureController } from './api-file-procedure.controller'
import { ApiFileProcedureDownloadExcel } from './api-file-procedure.download-excel'
import { ApiFileProcedureUploadExcel } from './api-file-procedure.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileProcedureController],
  providers: [ApiFileProcedureDownloadExcel, ApiFileProcedureUploadExcel, ApiProcedureGroupService],
})
export class ApiFileProcedureModule { }
