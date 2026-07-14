import { Module } from '@nestjs/common'
import { ProcedureGroupService } from '../../api/master-data/procedure_group/procedure-group.service'
import { ApiFileProcedureController } from './api-file-procedure.controller'
import { ApiFileProcedureDownloadExcel } from './api-file-procedure.download-excel'
import { ApiFileProcedureUploadExcel } from './api-file-procedure.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileProcedureController],
  providers: [ApiFileProcedureDownloadExcel, ApiFileProcedureUploadExcel, ProcedureGroupService],
})
export class ApiFileProcedureModule { }
